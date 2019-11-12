/**
 * CachedEndPoint.ts
 * @author Diao Zheng
 * @file An End Point that's driven by an arbitrary cache
 * @barrel export ICachedEndPointFetchOptions
 * @barrel export ICachedEndPointConfiguration
 */

import _ from "lodash";
import { Option, Unique } from "nasi";
import {
  concat,
  EMPTY,
  merge,
  Observable,
  of,
  OperatorFunction,
  partition,
  pipe,
  zip,
} from "rxjs";
import { concatMap, flatMap, map, pluck, share, tap } from "rxjs/operators";
import {
  EndPoint,
  EndPointPublicAction,
  IEndPointConfiguration,
} from "./EndPoint";
import {
  action,
  EndPointDispatchAction,
  fetchSuccess,
} from "./EndPointDispatchAction";
import { ICacheDriver } from "./ICacheDriver";

export interface ICachedEndPointFetchOptions {
  shouldEvict?: boolean;
}

export interface ICachedEndPointConfiguration<
  TContext,
  TQuery,
  TCacheKey,
  TResponse,
  TStagedResponse
> extends IEndPointConfiguration<TContext, TQuery, TResponse, TStagedResponse>
{
  computeHash: (context: TContext) => OperatorFunction<TQuery, TCacheKey>;
}

export function CachedEndPoint<
  TContext,
  TQuery,
  TCacheKey,
  TResponse,
  TStagedResponse = Response,
>(
  driver: ICacheDriver<TResponse, TCacheKey>,
  config: ICachedEndPointConfiguration<
    TContext,
    TQuery,
    TCacheKey,
    TResponse,
    TStagedResponse
  >,
  context: TContext,
): OperatorFunction<
  EndPointPublicAction<TQuery & ICachedEndPointFetchOptions>,
  Observable<EndPointDispatchAction<TQuery, TResponse>>
> {
  const idGenerator = new Unique("CachedEndPoint_" + config.name);
  const scope = idGenerator.opaque;

  return pipe(
    map((fetchAction) => {
      const query = fetchAction.payload;
      const fetchId = idGenerator.opaque;

      const getAction = action<TQuery, TResponse>(scope, fetchId, query);
      const startTime = Date.now();

      const [ hit$, miss$ ]: [
        Observable<Option.Type<TResponse>>,
        Observable<unknown>
      ] =
        query.shouldEvict ?
          [ EMPTY, of(1 as unknown) ]
        :
          partition(
            of(query).pipe(
              config.computeHash(context),
              driver.get,
              share(),
            ),
            Option.isSome,
          )
      ;

      return concat(
        of(getAction("FETCH_START")()),
        merge(
          hit$.pipe(
            map((value) => fetchSuccess(scope, fetchId, true, query, value!)),
          ),
          miss$.pipe(
            map(() => fetchAction),
            EndPoint(config, context),
            flatMap((response$) => response$.pipe(
              concatMap((innerAction) => {
                switch (innerAction.action) {
                  case "FETCH_START":
                  case "FETCH_COMPLETE":
                    return EMPTY;
                  case "FETCH_FAILURE":
                    return of(getAction("FETCH_FAILURE")([
                      innerAction.payload.errorMessage,
                      innerAction.payload.shouldDisplay,
                    ]));
                  case "FETCH_SUCCESS":
                    const finishTime = Date.now();
                    return zip(
                      of(innerAction).pipe(
                        pluck("payload", "query"),
                        config.computeHash(context),
                      ),
                      of(innerAction).pipe(pluck("payload", "value")),
                    ).pipe(
                      driver.set,
                      tap(() => driver.updateHeuristic?.(
                        finishTime - startTime,
                      )),
                      map(getAction("FETCH_SUCCESS")),
                    );
                }
              }),
            )),
          ),
        ),
        of(1).pipe(map(getAction("FETCH_COMPLETE"))),
      );
    }),
  );
}

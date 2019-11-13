/**
 * EndPoint.ts
 * @author Diao Zheng
 * @file A re-implementation of the legacy EndPoint in MyM1 app using rxjs.
 * @barrel export EndPointPublicAction
 */
import _ from "lodash";
import { Option, Unique } from "nasi";
import { Action, Rx } from "nasi-lemak-react-types";
import {
  concat,
  from,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
  OperatorFunction,
  zip,
} from "rxjs";
import { catchError, map, share } from "rxjs/operators";
import { action, EndPointDispatchAction } from "./EndPointDispatchAction";

export type EndPointPublicAction<TQuery> = Action.Type<"BEGIN_FETCH", TQuery>;

export type StagedTransform<TContext, TStagedResponse> =
  Response extends TStagedResponse ?
    TStagedResponse extends Response ?
      Option.Type<(context: TContext) => MonoTypeOperatorFunction<Response>>
    :
      Option.Type<
        (context: TContext) => OperatorFunction<Response, TStagedResponse>
      >
  :
    (context: TContext) => OperatorFunction<Response, TStagedResponse>
;

export interface IEndPointConfiguration<
  TContext,
  TQuery,
  TResponse,
  TStagedResponse,
  TStagedSucessResponse extends TStagedResponse = TStagedResponse
>
{
  name?: string;
  transformRequest: (context: TContext) =>
    OperatorFunction<TQuery, readonly [ string, RequestInit ]>;
  transformResponse: (context: TContext) =>
    OperatorFunction<readonly [ TStagedSucessResponse, TQuery ], TResponse>;
  isSuccess: (raw: TStagedResponse) => raw is TStagedSucessResponse;
  transformError: (context: TContext) =>
    OperatorFunction<any, readonly [ string, boolean ]>;
  transformResponseStaged: StagedTransform<TContext, TStagedResponse>;
}

function transformResponseStagedGuard<
  TContext,
  TStagedResponse
>(
  transformResponseStaged: StagedTransform<TContext, TStagedResponse>,
  context: TContext,
): OperatorFunction<Response, TStagedResponse> {
  if (transformResponseStaged) {
    return transformResponseStaged(
      context,
    ) as OperatorFunction<Response, TStagedResponse>;
  }
  return _.identity;
}

export function EndPoint<
  TContext,
  TQuery,
  TResponse,
  TStagedResponse = Response,
  TStagedSucessResponse extends TStagedResponse = TStagedResponse
>(
  config: IEndPointConfiguration<
    TContext,
    TQuery,
    TResponse,
    TStagedResponse,
    TStagedSucessResponse
  >,
  context: TContext,
): OperatorFunction<
  Action.Type<"BEGIN_FETCH", TQuery>,
  Observable<EndPointDispatchAction<TQuery, TResponse>>
>
{
  const idGenerator = new Unique("EndPoint_" + config.name);
  const scope = idGenerator.opaque;
  return (source) => zip(
    source,
    source.pipe(
      map(({ payload }) => payload),
      config.transformRequest(context),
    ),
  ).pipe(
    map(([{ payload }, [ query, request ]]) => {
      const fetchId = idGenerator.opaque;

      const getAction = action<TQuery, TResponse>(scope, fetchId, payload);

      const [ success$, failure$ ] = Rx.partition(
        from(fetch(query, request)).pipe(
          transformResponseStagedGuard(
            config.transformResponseStaged,
            context,
          ),
          share(),
        ),
        config.isSuccess,
      );

      return concat(
        of(getAction("FETCH_START")()),
        merge(
          success$.pipe(
            map((response) => [ response, payload ] as const),
            config.transformResponse(context),
            map(getAction("FETCH_SUCCESS")),
          ),
          failure$.pipe(
            config.transformError(context),
            map(getAction("FETCH_FAILURE")),
          ),
        ).pipe(
          catchError((e) => of(e).pipe(
            config.transformError(context),
            map(getAction("FETCH_FAILURE")),
          )),
        ),
        of(1).pipe(map(getAction("FETCH_COMPLETE"))),
      );
    }),
  );
}

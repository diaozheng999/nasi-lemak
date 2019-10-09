/**
 * EndPointDispatchAction.ts
 * @author Diao Zheng
 * @file Defines actions and helper functions that generate the actions
 * @barrel export IFetchStartPayload
 * @barrel export IFetchSuccessPayload
 * @barrel export IFetchFailurePayload
 * @barrel export IFetchCompletePayload
 */

import { UniqueValue } from "nasi";
import { Action } from "nasi-lemak-react-types";

export interface IFetchStartPayload<Q> {
  startTime: number;
  fetchId: UniqueValue;
  query: Q;
}

export interface IFetchSuccessPayload<Q, T> {
  value: T;
  isCachedResponse: boolean;
  fetchId: UniqueValue;
  finishTime: number;
  query: Q;
}

export interface IFetchFailurePayload<Q> {
  errorMessage: string;
  fetchId: UniqueValue;
  finishTime: number;
  shouldDisplay: boolean;
  query: Q;
}

export interface IFetchCompletePayload<Q> {
  fetchId: UniqueValue;
  finishTime: number;
  query: Q;
}

type StartAction<Q> = Action.Scoped<
  UniqueValue,
  Action.Type<"FETCH_START", IFetchStartPayload<Q>>
>;
type SuccessAction<Q, T>= Action.Scoped<
  UniqueValue,
  Action.Type<"FETCH_SUCCESS", IFetchSuccessPayload<Q, T>>
>;
type FailureAction<Q> = Action.Scoped<
  UniqueValue,
  Action.Type<"FETCH_FAILURE", IFetchFailurePayload<Q>>
>;

type CompleteAction<Q>= Action.Scoped<
  UniqueValue,
  Action.Type<"FETCH_COMPLETE", IFetchCompletePayload<Q>>
>;

export type EndPointDispatchAction<Q, T> =
  | StartAction<Q>
  | SuccessAction<Q, T>
  | FailureAction<Q>
  | CompleteAction<Q>
;

export function fetchComplete<Q>(
  scope: UniqueValue,
  fetchId: UniqueValue,
  query: Q,
): CompleteAction<Q> {
  return {
    action: "FETCH_COMPLETE",
    payload: {
      fetchId,
      finishTime: new Date().getTime(),
      query,
    },
    scope,
  };
}

export function fetchStart<Q>(
  scope: UniqueValue,
  fetchId: UniqueValue,
  query: Q,
): StartAction<Q> {
  return {
    action: "FETCH_START",
    payload: {
      fetchId,
      query,
      startTime: new Date().getTime(),
    },
    scope,
  };
}

export function fetchFailure<Q>(
  scope: UniqueValue,
  fetchId: UniqueValue,
  query: Q,
  errors: readonly [ string, boolean ],
): FailureAction<Q> {
  return {
    action: "FETCH_FAILURE",
    payload: {
      errorMessage: errors[0],
      fetchId,
      finishTime: new Date().getTime(),
      query,
      shouldDisplay: errors[1],
    },
    scope,
  };
}

export function fetchSuccess<Q, T>(
  scope: UniqueValue,
  fetchId: UniqueValue,
  isCachedResponse: boolean,
  query: Q,
  value: T,
): SuccessAction<Q, T> {
  return {
    action: "FETCH_SUCCESS",
    payload: {
      fetchId,
      finishTime: new Date().getTime(),
      isCachedResponse,
      query,
      value,
    },
    scope,
  };
}

export function successAndFailureOnly<Q, T>(
  a: EndPointDispatchAction<Q, T>,
): a is SuccessAction<Q, T> | FailureAction<Q> {
  return a.action === "FETCH_SUCCESS" || a.action === "FETCH_FAILURE";
}

type RealisedActionMapper<Q, T, A> = (
  A extends "FETCH_START" ?
    () => EndPointDispatchAction<Q, T>
  : A extends "FETCH_SUCCESS" ?
    (value: T) => EndPointDispatchAction<Q, T>
  : A extends "FETCH_FAILURE" ?
    (error: readonly [ string, boolean ]) => EndPointDispatchAction<Q, T>
  : A extends "FETCH_COMPLETE" ?
    () => EndPointDispatchAction<Q, T>
  :
    unknown
);

export function action<Q, T>(
  scope: UniqueValue,
  fetchId: UniqueValue,
  query: Q,
) {
  return <A extends EndPointDispatchAction<Q, T>["action"]>(
    key: A,
  ): RealisedActionMapper<Q, T, A> => {
    switch (key) {
      case "FETCH_COMPLETE":
        return fetchComplete.bind(undefined, scope, fetchId, query) as any;
      case "FETCH_FAILURE":
        return fetchFailure.bind(undefined, scope, fetchId, query) as any;
      case "FETCH_START":
        return fetchStart.bind(undefined, scope, fetchId, query) as any;
      case "FETCH_SUCCESS":
        return fetchSuccess.bind(
          undefined,
          scope,
          fetchId,
          false,
          query,
        ) as any;
    }
    return null as any;
  };
}

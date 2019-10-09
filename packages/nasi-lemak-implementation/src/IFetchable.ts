/**
 * IFetchable.ts
 * @author Diao Zheng
 * @file Defines the Fetchable interface.
 * @ignore_test
 * @barrel export EndPointDispatchAction
 * @barrel export IFetchStartPayload
 * @barrel export IFetchSuccessPayload
 * @barrel export IFetchFailurePayload
 */

import { UniqueValue } from "nasi";
import { Action } from "nasi-lemak-react-types";
import { Language } from "./Localisation";

export interface IFetchStartPayload {
  startTime: number;
  fetchId: UniqueValue;
}

export interface IFetchSuccessPayload<T> {
  value: T;
  isCachedResponse: boolean;
  fetchId: UniqueValue;
  finishTime: number;
}

export interface IFetchFailurePayload {
  errorMessage: string;
  fetchId: UniqueValue;
  finishTime: number;
  shouldDisplay: boolean;
}

export type EndPointDispatchAction<T> =
  | Action.Scoped<UniqueValue, Action.Type<"FETCH_START", IFetchStartPayload>>
  | Action.Scoped<
      UniqueValue,
      Action.Type<"FETCH_SUCCESS", IFetchSuccessPayload<T>>
    >
  | Action.Scoped<
      UniqueValue,
      Action.Type<"FETCH_FAILURE", IFetchFailurePayload>
    >
;

export interface IFetchable<TQuery, TRequest, TResponse> {
  attach(
    dispatch: React.Dispatch<EndPointDispatchAction<TResponse>>,
  ): UniqueValue;
  detach(key: UniqueValue): void;
  fetchAndDispatch(
    language: Language,
    query?: TQuery,
    request?: TRequest,
  ): any;
}

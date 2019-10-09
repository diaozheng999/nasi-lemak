/**
 * IFetchable.ts
 * @author Diao Zheng
 * @file Defines the Fetchable interface.
 * @ignore_tests
 * @barrel export DispatchActionOf
 */

import { UniqueValue } from "nasi";
import React from "react";
import { EndPointDispatchAction } from "./EndPointDispatchAction";

export type DispatchActionOf<T> = (
  T extends IFetchable<any, infer Q, any, infer R> ?
    EndPointDispatchAction<Q, R>
  :
    never
);

export interface IFetchable<THeader, TQuery, TRequest, TResponse> {
  attach(
    dispatch: React.Dispatch<
      EndPointDispatchAction<TQuery, TResponse>
    >,
  ): UniqueValue;
  detach(key: UniqueValue): void;
  fetchAndDispatch(
    header?: THeader,
    query?: TQuery,
    request?: TRequest,
  ): any;
}

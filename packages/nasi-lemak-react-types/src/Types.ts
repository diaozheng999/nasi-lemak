/**
 * Types.ts
 * @author Diao Zheng
 * @file Specific type extractors for nasi lemak components
 * @barrel export all
 * @ignore_test
 */

import React from "react";
import { Component } from "./Component";
import * as Intent from "./Intent";

export type PropType<T> =
  T extends Component<infer RP, any, any, any> ?
    RP
  : T extends React.FunctionComponent<infer FP> ?
    FP
  : T extends React.Component<infer CP> ?
    CP
  :
    never
;

export type StateType<T> =
  T extends Component<any, infer RS, any, any> ?
    RS
  : T extends React.Component<any, infer CS> ?
    CS
  :
    never
;

export type ActionType<T> =
  T extends Component<any, any, infer A, any> ?
    A
  :
    never
;

export type PublicActionType<T> =
  T extends Component<any, any, any, infer PA> ?
    PA
  :
    never
;

export type ReducerType<T> =
  T extends Component<any, infer S, infer A, any> ?
    (state: S, action: A) => Intent.Type<S>
  :
    never
;

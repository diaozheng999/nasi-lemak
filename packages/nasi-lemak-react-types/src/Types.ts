/**
 * Types.ts
 * @author Diao Zheng
 * @file Specific type extractors for nasi lemak components
 * @barrel export all
 * @ignore_test
 */

import React from "react";
import { Component } from "./Component";
import { DispatchComponent } from "./DispatchComponent";
import * as Intent from "./Intent";
import { ReducerComponent } from "./ReducerComponent";

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
  : T extends DispatchComponent<infer DA, any, any, any, any> ?
    DA
  : T extends ReducerComponent<any, any, infer RA, any> ?
    RA
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
  : T extends DispatchComponent<infer DA, any, infer DS, any, any> ?
    (state: DS, action: DA) => Intent.Type<DS>
  : T extends ReducerComponent<any, infer RS, infer RA, any> ?
    (state: RS, action: RA) => Intent.Type<RS>
  :
    never
;

/**
 * Rescope.ts
 * @author Diao Zheng
 * @file Rescope a dispatch
 * @barrel export Restrict
 */

import React from "react";
import { Rescoped, Scoped } from "./Action";

export function Rescope<TNewScope, TAction extends Scoped<any, any>>(
  scope: TNewScope,
  dispatch: React.Dispatch<Rescoped<TNewScope, TAction>>,
): React.Dispatch<TAction>;
export function Rescope<TScope, TAction>(
  scope: TScope,
  dispatch: React.Dispatch<Scoped<TScope, TAction>>,
): React.Dispatch<TAction>;
export function Rescope<TScope, TAction>(
  scope: TScope,
  dispatch: React.Dispatch<Scoped<TScope, TAction>>,
): React.Dispatch<TAction>
{
  return (action) => {
    dispatch({ ...action, scope });
  };
}

export function Restrict<S>(dispatch: React.Dispatch<S>): React.Dispatch<S> {
  return dispatch;
}

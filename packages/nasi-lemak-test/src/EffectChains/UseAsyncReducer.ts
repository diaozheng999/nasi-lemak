/**
 * UseReducer.ts
 * @author Diao Zheng
 * @file useState compatible hook
 */

import { Intent, Stable } from "nasi-lemak";
import React from "react";
import { IHookEffectChain } from "../Interfaces";
import { ReducerHookSideEffectChain } from "./ReducerHookSideEffectChain";

export class UseAsyncReducer<
  TState,
  TAction,
  TPublicAction extends TAction = never
>
extends ReducerHookSideEffectChain<TState, TAction, TPublicAction>
implements IHookEffectChain<
  (
    reducer: (state: TState, action: TAction) => Intent.Type<TState>,
    initialState: TState,
  ) => [ TState, Stable.Dispatch<TAction>, Stable.Dispatch<TPublicAction> ]
> {

  public executeHook(
    ReactActual: typeof React,
    reducer: (state: TState, action: TAction) => Intent.Type<TState>,
    initialState: TState,
  ): [ TState, Stable.Dispatch<TAction>, Stable.Dispatch<TPublicAction> ] {
    return this.executeHookInternal(ReactActual, reducer, initialState);
  }

}

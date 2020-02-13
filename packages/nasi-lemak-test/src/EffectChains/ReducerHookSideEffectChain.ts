/**
 * ReducerHookSideEffectChain.ts
 * @author Diao Zheng
 * @file useState compatible hook
 */

import { assert, Intent, Option, Stable, Unique } from "nasi-lemak";
import React from "react";
import { Action } from "../Effects";
import { IDescribable } from "../Interfaces";
import { ProxySideEffectChain } from "./ProxySideEffectChain";
import { Reducer } from "./Reducer";

const UNSET = Symbol("NasiLemakTest/UNSET");

/**
 * An internal shared class that is used to implement the hooks of:
 *   - useAsyncReducer
 *   - useReducer
 */
export class ReducerHookSideEffectChain<
  TState,
  TAction,
  TPublicAction extends TAction = never
> extends ProxySideEffectChain<Reducer<TState, TAction>> {

  private currentState: TState | typeof UNSET = UNSET;

  constructor(
    spawnedBy: IDescribable,
    spawner?: Unique,
  ) {
    super(spawnedBy, spawner ?? new Unique("ReducerHookSideEffectChain"), true);
  }

  public setPersistence(__: boolean) {
    throw new Error("A UseState chain is always persistent.");
  }

  protected executeHookInternal(
    ReactActual: typeof React,
    reducer: (state: TState, action: TAction) => Intent.Type<TState>,
    initialState: TState,
  ): [ TState, Stable.Dispatch<TAction>, Stable.Dispatch<TPublicAction> ] {

    const [ state, setState ] = ReactActual.useState<TState>(initialState);

    this.currentState = state;

    if (this.state.type === "PENDING") {
      this.push(new Reducer(
        reducer,
        () => this.currentState as any,
        setState as any,
        this,
      ));
    }

    const dispatch = ReactActual.useCallback((action: TAction) => {
      assert(Option.isSome, this.chain.value);
      this.chain.value.enqueue(new Action(action));
    }, []);

    return [ this.currentState, dispatch, dispatch ];
  }

}

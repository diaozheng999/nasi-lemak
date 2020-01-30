/**
 * UseReducer.ts
 * @author Diao Zheng
 * @file useState compatible hook
 */

import { Intent, Option, Stable, Unique } from "nasi-lemak";
import React, { SetStateAction } from "react";
import { SetStateEffect } from "../Effects";
import { IDescribable, IHookEffectChain } from "../Interfaces";
import { Reducer } from "./Reducer";
import { SerialSideEffectChain } from "./SerialSideEffectChain";

const UNSET = Symbol("NasiLemakTest/UNSET");

export class UseReducer<R extends React.Reducer<any, any>, I>
extends SerialSideEffectChain
implements IHookEffectChain<any> {

  private currentState: React.ReducerState<R> | typeof UNSET = UNSET;
  private reducer:
    | Reducer<React.ReducerState<R>, React.ReducerAction<R>>
    | typeof UNSET = UNSET;

  constructor(
    spawnedBy: IDescribable,
    spawner?: Unique,
  ) {
    super(spawnedBy, spawner ?? new Unique("UseState"), true);
  }

  public setPersistence(__: boolean) {
    throw new Error("A UseState chain is always persistent.");
  }

  public executeHook(
    ReactActual: typeof React,
    reducer: R,
    initialiserArgs: I,
    initialiser?: (args: I) => React.ReducerState<R>,
  ) {

    const [ state, setState ] = ReactActual.useState<React.ReducerState<R>>(
      Option.mapChoice(
        initialiser,
        (init) => init(initialiserArgs),
        initialiserArgs as any,
      ),
    );

    this.currentState = state;

    if (this.reducer === UNSET) {
      const reducerChain = new Reducer(
        this.reactReducerCompat.bind(this, reducer),
        () => this.currentState as any,
        setState as any,
        this,
      );

      this.chain.addToEnd(reducerChain);
      this.reducer = reducerChain;
    }
  }

  protected push(effect: SetStateEffect<S>) {
    switch (effect.kind) {
      case "SET_STATE_EFFECT":
        effect.__internal_setExecutor(this.setState);
        this.chain.addToEnd(effect);
        break;

      default:
        throw new Error(
          "Only SetStateEffect can be committed into UseState.",
        );
    }
  }

  private reactReducerCompat(
    reducer: R,
    state: React.ReducerState<R>,
    action: React.ReducerAction<R>,
  ): Intent.Type<React.ReducerState<R>> {
    const result = reducer(state, action);
    if (result === state) {
      return Intent.NoUpdate();
    } else {
      return Intent.Update(result);
    }
  }

}

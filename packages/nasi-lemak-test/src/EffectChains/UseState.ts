/**
 * UseState.ts
 * @author Diao Zheng
 * @file useState compatible hook
 */

import { Stable, Unique } from "nasi-lemak";
import React, { SetStateAction } from "react";
import { SetStateEffect } from "../Effects";
import { IDescribable, IHookEffectChain } from "../Interfaces";
import { SerialSideEffectChain } from "./SerialSideEffectChain";

const UNSET = Symbol("NasiLemakTest/UNSET");

/**
 * Checks if action is a state update action, based on
 * https://github.com/facebook/react/pull/13968
 */
function setStateActionUsesPrevState<S>(
  action: SetStateAction<S>,
): action is (prevState: S) => S {
  return typeof action === "function";
}

export class UseState<S>
extends SerialSideEffectChain
implements IHookEffectChain<any /* this should be typeof useState<S> */> {

  private currentState: S | typeof UNSET = UNSET;

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
    initialState: S | (() => S),
  ): [ S, Stable.Dispatch<SetStateAction<S>> ] {

    const [ state, reactSetState ] = ReactActual.useState(initialState);

    if (this.currentState === UNSET) {
      this.currentState = state;
    } else if (this.currentState !== state) {
      this.currentState = state;
    }

    const setState = ReactActual.useCallback((action: SetStateAction<S>) => {
      const effect = new SetStateEffect(action);
      effect.__internal_setExecutor(this.setState.bind(this, reactSetState));
      this.enqueue(effect);
    }, []);
    return [ this.currentState, setState ];
  }

  protected push(effect: SetStateEffect<S>) {
    switch (effect.kind) {
      case "SET_STATE_EFFECT":
        this.chain.addToEnd(effect);
        break;

      default:
        throw new Error(
          "Only SetStateEffect can be committed into UseState.",
        );
    }
  }

  private setState(
    reactSetStateFunction: Stable.Dispatch<React.SetStateAction<S>>,
    action: SetStateAction<S>,
  ) {
    if (this.currentState === UNSET) {
      throw new Error(
        "A SetStateEffect is executed before the state is being initialised.",
      );
    }
    if (setStateActionUsesPrevState(action)) {
      this.currentState = action(this.currentState);
    }
    reactSetStateFunction(this.currentState);
  }
}

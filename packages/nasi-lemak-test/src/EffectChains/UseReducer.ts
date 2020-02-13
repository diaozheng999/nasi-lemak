/**
 * UseReducer.ts
 * @author Diao Zheng
 * @file useState compatible hook
 */

import { Intent, Option, Stable } from "nasi-lemak";
import React from "react";
import { IHookEffectChain } from "../Interfaces";
import { ReducerHookSideEffectChain } from "./ReducerHookSideEffectChain";

export class UseReducer<R extends React.Reducer<any, any>, I>
extends ReducerHookSideEffectChain<
  React.ReducerState<R>,
  React.ReducerAction<R>,
  never
>
implements IHookEffectChain<any> {

  public executeHook(
    ReactActual: typeof React,
    reducer: R,
    initialiserArgs: I,
    initialiser?: (args: I) => React.ReducerState<R>,
  ): [ React.ReducerState<R>, Stable.Dispatch<React.ReducerAction<R>> ] {
    const [ state, dispatch ] = super.executeHookInternal(
      ReactActual,
      this.reactReducerCompat.bind(this, reducer),
      Option.mapChoice(
        initialiser,
        (init) => init(initialiserArgs),
        initialiserArgs as any,
      ),
    );
    return [ state, dispatch ];
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

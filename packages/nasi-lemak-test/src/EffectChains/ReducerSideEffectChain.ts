
/**
 * ReducerSideEffectChain.ts
 * @author Diao Zheng
 * @file A Reducer Side Effect Chain
 */

import { Intent, Unique } from "nasi-lemak";
import { IDescribable } from "../Interfaces";
import { SerialSideEffectChain } from "./SerialSideEffectChain";

export class ReducerSideEffectChain<TState, TAction>
extends SerialSideEffectChain {

  protected reducer: (state: TState, action: TAction) => Intent.Type<TState>;

  constructor(
    reducer: (state: TState, action: TAction) => Intent.Type<TState>,
    spawnedBy: IDescribable,
    generator?: Unique,
  ) {
    super(spawnedBy, generator);
    this.reducer = reducer;
  }

  public send(action: TAction) {

  }
}

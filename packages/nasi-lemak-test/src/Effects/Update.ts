/**
 * Update.ts
 * @author Diao Zheng
 * @file Describes a side effect that's a DOM Update
 */

import _ from "lodash";
import { Unique } from "nasi-lemak";
import { DomMutatingSideEffect } from "./DomMutatingSideEffect";

const CHAR_COUNT_TO_ABBREVIATE = 20;

export class Update<TState> extends DomMutatingSideEffect {

  private stateToUpdate: any;

  constructor(stateToUpdate: TState, executor: () => void, generator?: Unique) {
    super(executor, generator);
    this.stateToUpdate = stateToUpdate;
  }

  protected describeEffect() {
    const keyArray = _.keys(this.stateToUpdate).map((key) => `"${key}"`);
    const keys = keyArray.join(", ");
    if (keys.length === 1) {
      return `Update State ${keys}`;
    } else if (keys.length < CHAR_COUNT_TO_ABBREVIATE) {
      return `Update States ${keys}`;
    } else {
      return `Update ${keyArray.length} State(s)`;
    }
  }
}

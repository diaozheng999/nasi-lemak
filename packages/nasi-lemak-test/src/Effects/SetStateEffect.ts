/**
 * SetStateEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that represents a useState setState function
 */

import { SetStateAction } from "react";
import { AttachedSideEffect } from "./AttachedSideEffect";

export class SetStateEffect<T> extends AttachedSideEffect<SetStateAction<T>> {
  public readonly kind = "SET_STATE_EFFECT";

  protected describeEffect() {
    return `SetStateEffect ${this.getId()}`;
  }
}

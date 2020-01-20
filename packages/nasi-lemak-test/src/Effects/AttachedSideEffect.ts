/**
 * AttachedSideEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that's attached to an executor
 */

import { assert, Option, Unique } from "nasi-lemak";
import { SideEffect } from "./SideEffect";

export class AttachedSideEffect<TAction> extends SideEffect {
  public readonly attachedAction: TAction;
  private executor?: (args: TAction) => void;

  constructor(action: TAction, generator?: Unique) {
    super(() => this.__internal_execute(), generator);
    this.attachedAction = action;
  }

  public __internal_setExecutor(executor: (action: TAction) => void) {
    this.executor = executor;
  }

  private __internal_execute() {
    assert(
      Option.isSome,
      this.executor,
      "Actions can only be executed by a Reducer.",
    );
    this.executor(this.attachedAction);
  }
}

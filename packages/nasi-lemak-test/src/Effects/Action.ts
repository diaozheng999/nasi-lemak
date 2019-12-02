/**
 * Action.ts
 * @author Diao Zheng
 * @file Describes a side effect that's a pending action
 */

import _ from "lodash";
import { assert, Option, Unique } from "nasi-lemak";
import { SideEffect } from "./SideEffect";

export class Action<TAction> extends SideEffect {

  public readonly reducerAction: any;
  private executor?: (action: TAction) => void;

  constructor(
    action: TAction,
    generator?: Unique,
  ) {
    super(() => this.__internal_execute(), generator);
    this.reducerAction = action;
  }

  public __internal_setExecutor(executor: (action: TAction) => void) {
    this.executor = executor;
  }

  protected describeEffect() {
    if (typeof this.reducerAction === "string") {
      return `Legacy Action "${this.reducerAction}"`;
    }
    return `Action "${this.reducerAction.action}"`;
  }

  private __internal_execute() {
    assert(
      Option.isSome,
      this.executor,
      "Actions can only be executed by a Reducer.",
    );
    this.executor(this.reducerAction);
  }
}

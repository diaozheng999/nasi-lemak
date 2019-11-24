/**
 * Action.ts
 * @author Diao Zheng
 * @file Describes a side effect that's a pending action
 */

import { SideEffect } from "./SideEffect";

export class Action<TAction> extends SideEffect {

  private reducerAction: any;

  constructor(action: TAction, executor: () => void, generator?: Unique) {
    super(executor, generator);
    this.reducerAction = action;
  }

  protected describeEffect() {
    if (typeof this.reducerAction === "string") {
      return `Legacy Action "${this.reducerAction}"`;
    }
    return `Action "${this.reducerAction.action}"`;
  }
}

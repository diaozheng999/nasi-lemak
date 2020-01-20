/**
 * Action.ts
 * @author Diao Zheng
 * @file Describes a side effect that's a pending action
 */

import _ from "lodash";
import { AttachedSideEffect } from "./AttachedSideEffect";

export class Action<TAction> extends AttachedSideEffect<TAction> {

  declare public readonly attachedAction: any;

  protected describeEffect() {
    if (typeof this.attachedAction === "string") {
      return `Legacy Action "${this.attachedAction}"`;
    }
    return `Action "${this.attachedAction.action}"`;
  }
}

/**
 * Dispatch.ts
 * @author Diao Zheng
 * @file A Side Effect that represents a dispatch action.
 */

import { UniqueValue } from "nasi-lemak";
import { Duration } from "../Utils";
import { SideEffect } from "./SideEffect";

export class Dispatch<T> extends SideEffect {

  private dispatchAction: any;
  private listenerId: UniqueValue;

  constructor(
    action: T,
    listenerId: UniqueValue,
    listener: (action: T) => void,
  ) {
    super(listener.bind(undefined, action), undefined, Duration.INSTANT);
    this.listenerId = listenerId;
    this.dispatchAction = action;
  }

  protected describeEffect() {
    return `Dispatch ${this.getActionName()} to ${this.listenerId}`;
  }

  private getActionName() {
    if (typeof this.dispatchAction === "string") {
      return this.dispatchAction;
    }
    return this.dispatchAction.action;
  }
}

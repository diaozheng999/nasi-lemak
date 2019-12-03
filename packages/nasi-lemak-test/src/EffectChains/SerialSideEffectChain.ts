/**
 * SerialSideEffectChain.ts
 * @author Diao Zheng
 * @file Describes a chain of side effects
 */

import { LinkedList } from "nasi";
import { SideEffect } from "../Effects/SideEffect";
import { Duration } from "../Utils";
import { SideEffectChain } from "./SideEffectChain";

export class SerialSideEffectChain extends SideEffectChain {
  protected chain: LinkedList<SideEffect | SideEffectChain> = new LinkedList();

  protected push(effect: SideEffect | SideEffectChain) {
    this.chain.addToEnd(effect);
  }

  protected advance(duration: Duration.Type): Duration.Type {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        if (!this.state.current.isCompleted()) {
          return duration;
        }
    }

    const next = this.chain.removeFromFront();
    if (next instanceof SideEffectChain) {
      this.state = { current: next, type: "EXECUTING_CHAIN" };
    } else if (next) {
      this.state = { current: next, type: "EXECUTING" };
    } else {
      this.state = { type: "COMPLETE" };
    }

    return duration;
  }

}

/**
 * RoundRobinSideEffectChain.ts
 * @author Diao Zheng
 * @file A Side Effect chain that executes all queued effects at random
 */

import { LinkedList, Unique } from "nasi";
import { SideEffect } from "../Effects";
import { Duration, IDescribable } from "../Interfaces";
import { SideEffectChain } from "./SideEffectChain";

const Generator = new Unique("RoundRobinSideEffectChain");

export class RoundRobinSideEffectChain extends SideEffectChain {

  protected chain: LinkedList<SideEffect | SideEffectChain> = new LinkedList();

  constructor(spawnedBy: IDescribable, generator?: Unique) {
    super(spawnedBy, generator ?? Generator);
  }

  public enqueue(effect: SideEffect | SideEffectChain) {
    this.chain.addToEnd(effect);
  }

  protected advance(duration: Duration.Type): Duration.Type {
    const next = this.chain.removeFromFront();
    if (!next) {
      this.state = { type: "COMPLETE" };
      return Duration.INSTANT;
    } else if (next.isCompleted()) {
      return this.advance(duration);
    } else if (next instanceof SideEffectChain) {
      this.state = { current: next, type: "EXECUTING_CHAIN" };
    } else {
      this.state = { current: next, type: "EXECUTING" };
    }

    this.chain.addToEnd(next);
    return duration;
  }

}

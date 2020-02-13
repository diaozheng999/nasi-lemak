/**
 * RoundRobinSideEffectChain.ts
 * @author Diao Zheng
 * @file A Side Effect chain that executes all queued effects at random
 */

import { LinkedList, Option, Unique } from "nasi-lemak";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { SideEffectChain } from "./SideEffectChain";

const Generator = new Unique("RoundRobinSideEffectChain");

export class RoundRobinSideEffectChain extends SideEffectChain {

  protected chain: LinkedList<SideEffect | SideEffectChain> = new LinkedList();
  protected suspendedChains: LinkedList<SideEffectChain> = new LinkedList();

  constructor(
    spawnedBy: IDescribable,
    generator?: Unique,
    persistent?: boolean,
  ) {
    super(spawnedBy, generator ?? Generator, persistent);
  }

  protected push(effect: SideEffect | SideEffectChain) {
    this.chain.addToEnd(effect);
  }

  protected advance(duration: Duration.Type): Duration.Type {
    const next = this.chain.removeFromFront();
    if (!next) {
      this.state = {
        type: this.isPersistentAndActive() ? "SUSPENDED" : "COMPLETE",
      };

      while (this.suspendedChains.length > 0) {
        const chain = this.suspendedChains.removeFromFront();
        if (Option.isSome(chain)) {
          this.chain.addToEnd(chain);
        }
      }

      return Duration.INSTANT;
    } else if (next.isCompleted()) {
      return this.advance(duration);
    } else if (next instanceof SideEffectChain) {

      if (next.isSuspendedOrComplete()) {
        this.suspendedChains.push(next);
        return this.advance(duration);
      }

      this.state = { current: next, stepCount: 0, type: "EXECUTING_CHAIN" };
    } else {
      this.state = { current: next, type: "EXECUTING" };
    }

    this.chain.addToEnd(next);
    return duration;
  }

}

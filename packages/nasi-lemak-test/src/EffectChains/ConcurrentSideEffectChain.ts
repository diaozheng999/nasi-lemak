/**
 * ConcurrentSideEffectChain.ts
 * @author Diao Zheng
 * @file A Side Effect chain that executes all streams at the same time
 */

import { Unique } from "nasi";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { SideEffectChain } from "./SideEffectChain";

const Generator = new Unique("RoundRobinSideEffectChain");

export class RoundRobinSideEffectChain extends SideEffectChain {

  protected chain: Array<SideEffect | SideEffectChain> = [];

  constructor(spawnedBy: IDescribable, generator?: Unique) {
    super(spawnedBy, generator ?? Generator);
  }

  public enqueue(effect: SideEffect | SideEffectChain) {
    this.chain.push(effect);
  }

  protected step() {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        for (const effect of this.chain) {
          effect.execute();
        }
        break;
      case "EXECUTING":
        throw new Error(
          `The EXECUTING state is not used in RoundRobinSideEffectChain ` +
          this.id,
        );
      default:
        super.step();
    }
  }

  protected advance() {
    this.chain = this.chain.filter((effect) => !effect.isCompleted());

    this.state =
      this.chain.length === 0 ?
        { type: "COMPLETE" }
      :
        { current: this, type: "EXECUTING_CHAIN" }
    ;
  }

}

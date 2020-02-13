/**
 * ConcurrentSideEffectChain.ts
 * @author Diao Zheng
 * @file A Side Effect chain that executes all streams at the same time
 */

import _ from "lodash";
import { Unique } from "nasi-lemak";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { SideEffectChain } from "./SideEffectChain";

const Generator = new Unique("ConcurrentSideEffectChain");

export class ConcurrentSideEffectChain extends SideEffectChain {

  protected chain: Array<SideEffect | SideEffectChain> = [];

  constructor(
    spawnedBy: IDescribable,
    generator?: Unique,
    persistent?: boolean,
  ) {
    super(spawnedBy, generator ?? Generator, persistent);
  }

  protected push(effect: SideEffect | SideEffectChain) {
    this.chain.push(effect);
  }

  protected step(): Duration.Type {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        return this.chain.reduce<Duration.Type>(
          (acc, effect) => Duration.reducer(acc, effect.execute()),
          Duration.INSTANT,
        );
      case "EXECUTING":
        throw new Error(
          `The EXECUTING state is not used in ConcurrentSideEffectChain ` +
          this.id,
        );
      default:
        return super.step();
    }
  }

  protected advance(duration: Duration.Type): Duration.Type {
    this.chain = this.chain.filter((effect) => !effect.isCompleted());

    if (this.state.type === "EXECUTING_CHAIN") {
      ++this.state.stepCount;
      if (_.every(this.chain, SideEffectChain.isSuspendedOrComplete)) {
        this.state = {
          type: this.isPersistentAndActive() ? "SUSPENDED" : "COMPLETE",
        };
      }
      return duration;
    }

    this.state =
      this.chain.length === 0 ?
        { type: "COMPLETE" }
      :
        { current: this, stepCount: 0, type: "EXECUTING_CHAIN" }
    ;

    return duration;
  }

  protected describeStatus(
    prefix: string,
    blanks: string,
  ): string {
    switch (this.state.type) {
      case "EXECUTING":
        return `${this.id}    [!! UNREACHABLE ERROR STATE !!]`;
      case "EXECUTING_CHAIN":
        return `${this.id}    <executing [width ${this.chain.length}]>`;

      default:
        return super.describeStatus(prefix, blanks);
    }
  }

}
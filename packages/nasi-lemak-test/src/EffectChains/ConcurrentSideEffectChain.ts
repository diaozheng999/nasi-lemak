/**
 * ConcurrentSideEffectChain.ts
 * @author Diao Zheng
 * @file A Side Effect chain that executes all streams at the same time
 */

import { Unique } from "nasi";
import { SideEffect } from "../Effects";
import { Duration, IDescribable } from "../Interfaces";
import { SideEffectChain } from "./SideEffectChain";

const Generator = new Unique("ConcurrentSideEffectChain");

export function durationReducer(
  left: Duration.Type,
  right: Duration.Type,
): Duration.Type {
  if (left === Duration.INSTANT) {
    return right;
  }
  if (right === Duration.INSTANT) {
    return left;
  }

  if (typeof left === "number" && typeof right === "number") {
    return Math.max(left, right);
  }

  if (typeof left === "number") {
    return left;
  }
  if (typeof right === "number") {
    return right;
  }

  if (left === right) {
    return left;
  }

  if (left === Duration.NEXT_FRAME || right === Duration.NEXT_FRAME) {
    return Duration.NEXT_FRAME;
  }

  if (left === Duration.IMMEDIATE || right === Duration.IMMEDIATE) {
    return Duration.IMMEDIATE;
  }

  return Duration.FRAME;
}

export class ConcurrentSideEffectChain extends SideEffectChain {

  protected chain: Array<SideEffect | SideEffectChain> = [];

  constructor(spawnedBy: IDescribable, generator?: Unique) {
    super(spawnedBy, generator ?? Generator);
  }

  public enqueue(effect: SideEffect | SideEffectChain) {
    this.chain.push(effect);
  }

  protected step(): Duration.Type {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        return this.chain.reduce<Duration.Type>(
          (acc, effect) => durationReducer(acc, effect.execute()),
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

    this.state =
      this.chain.length === 0 ?
        { type: "COMPLETE" }
      :
        { current: this, type: "EXECUTING_CHAIN" }
    ;

    return duration;
  }

}

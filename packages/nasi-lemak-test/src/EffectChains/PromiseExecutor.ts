/**
 * PromiseExecutor.ts
 * @author Diao Zheng
 * @file A Promise executor that uses Side Effect Chains
 */

import { Unique } from "nasi-lemak";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { SerialSideEffectChain } from "./SerialSideEffectChain";

declare interface ISynchronousPromise<T> extends Promise<T> {
  isPending(): boolean;
}

const PromiseAwaiter = new Unique("PromiseAwaiter");
const ERROR_IF_PROMISE_REQUEUED_COUNT = 100000;

export class PromiseExecutor<T> extends SerialSideEffectChain {

  public static queued: number = 0;

  private requeuedCount: number = 0;
  private current?: ISynchronousPromise<void>;

  constructor(
    promise: (arg: T) => void | Promise<void>,
    value: T,
    spawnedBy: IDescribable,
    generator?: Unique,
  ) {
    super(spawnedBy, generator, false);

    if (!PromiseExecutor.queued) {
      (Promise as any).enableSynchronous();
      ++PromiseExecutor.queued;
    }

    this.enqueue(new SideEffect(this.spawn.bind(this, promise, value)));
  }

  protected advance(duration: Duration.Type): Duration.Type {
    const returnDuration = super.advance(duration);
    switch (this.state.type) {
      case "COMPLETE":
        if (!--PromiseExecutor.queued) {
          (Promise as any).disableSynchronous();
        }
    }
    return returnDuration;
  }

  private spawn(promise: (arg: T) => void | Promise<void>, value: T) {
    this.current = promise(value) as ISynchronousPromise<void>;
    if (this.current) {
      this.enqueue(
        new SideEffect(this.tick.bind(this), PromiseAwaiter, Duration.FRAME),
      );
    }
  }

  private tick() {
    if (this.current?.isPending()) {
      if (++this.requeuedCount > ERROR_IF_PROMISE_REQUEUED_COUNT) {
        throw new Error(
          `A promise has been executing for more than ` +
          `${ERROR_IF_PROMISE_REQUEUED_COUNT} frames. This could be an ` +
          `infinite loop or a promise that never resolves.\n` +
          `Promise: \n${this.describe("  ")}`,
        );
      }
      this.enqueue(
        new SideEffect(this.tick.bind(this), PromiseAwaiter, Duration.FRAME),
      );
    }
  }

}

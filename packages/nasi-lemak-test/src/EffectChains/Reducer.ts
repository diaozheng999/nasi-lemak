
/**
 * Reducer.ts
 * @author Diao Zheng
 * @file A Reducer Side Effect Chain
 */

import { assert, Intent, Option, requires, Unique } from "nasi-lemak";
import { Action, SideEffect, Update } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { ConcurrentSideEffectChain } from "./ConcurrentSideEffectChain";
import { PromiseExecutor } from "./PromiseExecutor";
import { SerialSideEffectChain } from "./SerialSideEffectChain";
import { SideEffectChain } from "./SideEffectChain";

export class Reducer<TState, TAction> extends SideEffectChain {

  protected reducer: (state: TState, action: TAction) => Intent.Type<TState>;

  protected getCurrentState: () => TState;
  protected updateState: (partialState: Partial<TState>) => void;

  private mainQueue: SideEffectChain;
  private updateQueue: SideEffectChain;
  private sideEffectQueue: SideEffectChain;

  protected get chain() {
    return [
      this.mainQueue,
      this.updateQueue,
      this.sideEffectQueue,
    ];
  }

  constructor(
    reducer: (state: TState, action: TAction) => Intent.Type<TState>,
    getCurrentState: () => TState,
    updateState: (partialState: Partial<TState>) => void,
    spawnedBy: IDescribable,
    id?: string,
  ) {
    super(spawnedBy, new Unique("Reducer"), true);

    const fixedId = id ?? this.id;

    this.reducer = reducer;
    this.getCurrentState = getCurrentState;
    this.updateState = updateState;
    this.mainQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_ReducerMainQueue`),
      true,
    );
    this.sideEffectQueue = new ConcurrentSideEffectChain(
      this,
      new Unique(`${fixedId}_ReducerSideEffectQueue`),
      true,
    );
    this.updateQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_UpdateQueue`),
      true,
    );
  }

  public setPersistence(__: boolean) {
    throw new Error("A Reducer is always persistent.");
  }

  public deactivate = () => {
    this.mainQueue.deactivate();
    this.updateQueue.deactivate();
    this.sideEffectQueue.deactivate();
  }

  @requires(function(this: SideEffectChain, __: Action<TAction>) {
    return !this.isCompleted();
  })
  protected push(effect: Action<TAction>) {
    effect.__internal_setExecutor(this.reduce.bind(this, effect));
    this.updateQueue.enqueue(effect);
  }

  protected step(): Duration.Type {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        const duration: Duration.Type[] = [
          this.mainQueue.execute(),
          this.updateQueue.execute(),
          this.sideEffectQueue.execute(),
        ];
        return duration.reduce(Duration.reducer);

      default:
        return super.step();
    }
  }

  protected describeStatus(
    prefix: string,
    blanks: string,
  ): string {
    switch (this.state.type) {
      case "EXECUTING":
        return `${this.id}    [!! UNREACHABLE ERROR STATE !!]`;
      case "EXECUTING_CHAIN":
        return (
          prefix +
          `main: ${this.mainQueue.describe(blanks + "      ", true)}\n` +
          blanks +
          `update: ${this.updateQueue.describe(blanks + "        ", true)}\n` +
          blanks +
          `effect: ${this.sideEffectQueue.describe(blanks + "        ", true)}`
        );

      default:
        return super.describeStatus(prefix, blanks);
    }
  }

  protected advance(duration: Duration.Type): Duration.Type {

    if (this.active) {
      this.incrementStepCount();
    } else if (
      !this.mainQueue.isCompleted() ||
      !this.updateQueue.isCompleted() ||
      !this.sideEffectQueue.isCompleted()
    ) {
      this.incrementStepCount();
    } else {
      this.state = { type: "COMPLETE" };
    }
    return duration;
  }

  private incrementStepCount() {
    if (this.state.type === "EXECUTING_CHAIN") {
      ++this.state.stepCount;
    } else {
      this.state = {
        current: this,
        stepCount: 0,
        type: "EXECUTING_CHAIN",
      };
    }
  }

  private reduce(context: SideEffect, action: TAction) {
    const currentState = this.getCurrentState();
    const intent = this.reducer(currentState, action);

    assert(
      Option.isSome,
      intent,
      "Received undefined in reducer intent. Is your reducer total?",
    );

    if (!intent) {
      return;
    }

    if (intent.update) {
      const update = intent.update;
      this.mainQueue.enqueue(new Update(intent.update, () => {
        this.updateState(update);
      }));
    }

    if (intent.effect) {
      for (const effect of intent.effect) {
        this.sideEffectQueue.enqueue(
          new PromiseExecutor(effect, currentState, context),
        );
      }
    }

  }

}

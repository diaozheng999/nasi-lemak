
/**
 * Reducer.ts
 * @author Diao Zheng
 * @file A Reducer Side Effect Chain
 */

import { assert, F,  Intent, Option, Unique } from "nasi-lemak";
import { Action, SideEffect, Update } from "../Effects";
import { Duration, IDescribable } from "../Interfaces";
import { 
  ConcurrentSideEffectChain,
  durationReducer,
} from "./ConcurrentSideEffectChain";
import { PromiseExecutor } from "./PromiseExecutor";
import { SerialSideEffectChain } from "./SerialSideEffectChain";
import { SideEffectChain } from "./SideEffectChain";

const Generator = new Unique("Reducer");

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
    super(spawnedBy, Generator);

    const fixedId = id ?? this.id;

    this.reducer = reducer;
    this.getCurrentState = getCurrentState;
    this.updateState = updateState;
    this.mainQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_ReducerMainQueue`),
    );
    this.sideEffectQueue = new ConcurrentSideEffectChain(
      this,
      new Unique(`${fixedId}_ReducerSideEffectQueue`),
    );
    this.updateQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_UpdateQueue`),
    );
  }

  public enqueue(effect: Action<TAction>) {
    effect.__internal_setExecutor(this.reduce.bind(this, effect));
    this.updateQueue.enqueue(effect);
  }

  protected step(): Duration.Type {
    switch (this.state.type) {
      case "EXECUTING":
        const mainQueue = this.mainQueue.executeOrNoop();
        const updateQueue = this.updateQueue.execute();
        
    }
  }

  protected advance(duration: Duration.Type): Duration.Type {
    throw new Error("Method not implemented.");
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

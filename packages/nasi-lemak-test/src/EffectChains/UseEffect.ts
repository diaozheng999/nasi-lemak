
/**
 * UseEffect.ts
 * @author Diao Zheng
 * @file useEffect compatible hook
 */

import { Unique } from "nasi-lemak";
import React, { DependencyList, EffectCallback, useEffect } from "react";
import { UseEffectHookCleanupEffect, UseEffectHookEffect } from "../Effects";
import { IDescribable, IHookEffectChain } from "../Interfaces";
import { Duration } from "../Utils";
import { SerialSideEffectChain } from "./SerialSideEffectChain";
import { SideEffectChain } from "./SideEffectChain";
export class UseEffect
extends SideEffectChain
implements IHookEffectChain<typeof useEffect> {

  private mainQueue: SideEffectChain;
  private cleanupQueue: SideEffectChain;

  protected get chain() {
    return [
      this.cleanupQueue,
      this.mainQueue,
    ];
  }

  constructor(
    spawnedBy: IDescribable,
    spawner?: Unique,
    id?: string,
  ) {
    super(spawnedBy, spawner ?? new Unique("UseEffect"), true);

    const fixedId = id ?? this.id;

    this.mainQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_MainQueue`),
      true,
    );

    this.cleanupQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_CleanupQueue`),
      true,
    );
  }

  public setPersistence(__: boolean) {
    throw new Error("A UseEffect chain is always persistent.");
  }

  public deactivate = () => {
    this.mainQueue.deactivate();
    this.cleanupQueue.deactivate();
  }

  public executeHook(
    ReactActual: typeof React,
    effect: EffectCallback,
    deps: DependencyList,
  ) {
    ReactActual.useMemo(() => {
      this.enqueue(new UseEffectHookEffect(effect));
    }, deps);
  }

  protected step: () => Duration.Type = () => {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        const duration: Duration.Type[] = [
          this.cleanupQueue.execute(),
          this.mainQueue.execute(),
        ];
        return duration.reduce(Duration.reducer);

      default:
        return super.step();
    }
  }

  protected push(effect: UseEffectHookEffect | UseEffectHookCleanupEffect) {
    switch (effect.kind) {

      case "USE_EFFECT_HOOK_EFFECT":
        effect.__internal_setExecutor(this.executeEffect.bind(this));
        this.mainQueue.enqueue(effect);
        break;

      case "USE_EFFECT_HOOK_CLEANUP_EFFECT":
        this.cleanupQueue.enqueue(effect);
        break;

      default:
        throw new Error(
          "Only UseEffectHookEffect and UseEffectHookCleanupEffect can be " +
          "committed into UseEffect.",
        );
    }
  }

  protected advance(duration: Duration.Type): Duration.Type {

    if (this.active) {
      this.incrementStepCount();
    } else if (
      !this.mainQueue.isCompleted() ||
      !this.cleanupQueue.isCompleted()
    ) {
      this.incrementStepCount();
    } else {
      this.state = { type: "COMPLETE" };
    }
    return duration;
  }

  protected describeStatus(
    prefix: string,
    blanks: string,
  ) {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        return `${this.id}    <useEffect hook>`;

      default:
        return super.describeStatus(prefix, blanks);
    }
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

  private executeEffect(effect: EffectCallback) {
    const result = effect();

    if (result) {
      this.push(new UseEffectHookCleanupEffect(result));
    }
  }

}

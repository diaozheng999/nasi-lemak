
/**
 * UseEffect.ts
 * @author Diao Zheng
 * @file useEffect compatible hook
 */

import { Option, Unique } from "nasi-lemak";
import React, { DependencyList, EffectCallback, useEffect } from "react";
import { UseEffectHookCleanupEffect, UseEffectHookEffect } from "../Effects";
import { IDescribable, IHookEffectChain } from "../Interfaces";
import { Duration } from "../Utils";
import { SerialSideEffectChain } from "./SerialSideEffectChain";

export class UseEffect
extends SerialSideEffectChain
implements IHookEffectChain<typeof useEffect> {

  private lastCleanupEffect?: UseEffectHookCleanupEffect;

  constructor(
    spawnedBy: IDescribable,
    spawner?: Unique,
  ) {
    super(spawnedBy, spawner ?? new Unique("UseEffect"), true);
  }

  public setPersistence(__: boolean) {
    throw new Error("A UseEffect chain is always persistent.");
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

  public deactivate() {
    if (Option.isSome(this.lastCleanupEffect)) {
      this.enqueue(this.lastCleanupEffect);
    }
    super.deactivate();
  }

  protected advance(duration: Duration.Type): Duration.Type {
    switch (this.state.type) {
      case "EXECUTING":
        if (
          this.state.current instanceof UseEffectHookCleanupEffect &&
          this.chain.length > 0
        ) {
          return this.step();
        }
        break;
    }
    return super.advance(duration);
  }

  protected push(effect: UseEffectHookEffect | UseEffectHookCleanupEffect) {
    switch (effect.kind) {

      case "USE_EFFECT_HOOK_EFFECT":
        effect.__internal_setExecutor(this.executeEffect.bind(this));
        this.chain.addToEnd(effect);
        break;

      case "USE_EFFECT_HOOK_CLEANUP_EFFECT":
        this.chain.addToEnd(effect);
        break;

      default:
        throw new Error(
          "Only UseEffectHookEffect can be committed into UseEffect.",
        );
    }
  }

  private executeEffect(effect: EffectCallback) {
    this.lastCleanupEffect?.execute();
    this.lastCleanupEffect = undefined;

    const result = effect();

    if (result) {
      this.lastCleanupEffect = new UseEffectHookCleanupEffect(result);
    }
  }

}

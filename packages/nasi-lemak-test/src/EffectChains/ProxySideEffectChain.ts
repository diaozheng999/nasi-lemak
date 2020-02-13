/**
 * ProxySideEffectChain.ts
 * @author Diao Zheng
 * @file A side effect chain that proxies another side effect chain.
 */

import { assert, Box, Disposable, Option } from "nasi";
import { SideEffect } from "../Effects";
import { Duration } from "../Utils";
import { SideEffectChain } from "./SideEffectChain";

export class ProxySideEffectChain<T extends SideEffectChain>
extends SideEffectChain {

  protected chain: Box<T> = new Box();

  public [Disposable.Dispose]() {
    if (this.chain.value?.isPersistent()) {
      Disposable.dispose(this.chain.value);
    }
    super[Disposable.Dispose]();
  }

  protected setProxiedChain(proxiedChain: T) {
    assert(
      Option.isNone,
      this.chain.value,
      "A proxied chain can only be set once. It already contains:\n" +
      this.chain.value?.describe(""),
    );
    this.chain.value = proxiedChain;
  }

  protected advance(duration: Duration.Type): Duration.Type {
    if (
      Option.isSome(this.chain.value) &&
      !this.chain.value.isSuspendedOrComplete()
    ) {
      this.state = {
        current: this.chain.value,
        stepCount: 0,
        type: "EXECUTING_CHAIN",
      };
    } else if (this.isPersistentAndActive()) {
      this.state = { type: "SUSPENDED" };
    } else {
      this.state = { type: "COMPLETE" };
    }
    return duration;
  }

  protected push(effect: SideEffectChain | SideEffect) {
    assert(
      Option.isSome,
      this.chain.value,
      "A proxied chain must exist to set effect:\n" + effect.describe(""),
    );
    this.chain.value.enqueue(effect);
  }

}

/**
 * ProxySideEffectChain.ts
 * @author Diao Zheng
 * @file A side effect chain that proxies another side effect chain.
 */

import { SideEffectChain } from "./SideEffectChain";
import { Box, Option, Unique, requires, P, assert } from 'nasi';
import { IDescribable } from '../Interfaces';
import { SideEffect } from '../Effects';

export class ProxySideEffectChain<T extends SideEffectChain>
extends SideEffectChain {

  protected chain: Box<T> = new Box();

  protected setProxiedChain(proxiedChain: T) {
    assert(
      Option.isNone,
      this.chain.value,
      "A proxied chain can only be set once. It already contains:\n" +
      this.chain.value?.describe(""),
    );
    this.chain.value = proxiedChain;
  }

  protected push(effect: SideEffectChain | SideEffect) {
    assert(
      Option.isSome,
      this.chain.value,
      "A proxied chain must exist to set effect:\n" + effect.describe(""),
    );
    this.chain.value.enqueue(effect);
  }

  public deactivate() {
    
  }

}

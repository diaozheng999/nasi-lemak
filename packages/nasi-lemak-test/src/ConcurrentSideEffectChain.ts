/**
 * ConcurrentSideEffectChain.ts
 * @author Diao Zheng
 * @file A Side Effect chain that executes all queued effects at random
 */

import { Unique } from "nasi";
import { SideEffectChain } from './SideEffectChain';
import { SideEffect } from './SideEffect';
import { IDescribable } from './IDescribable';

const Generator = new Unique("ConcurrentSideEffectChain");

export class ConcurrentSideEffectChain extends SideEffectChain {

  public static randomise: boolean = true;

  protected chain: Array<SideEffect | SideEffectChain> = [];

  constructor(spawnedBy: IDescribable, generator?: Unique) {
    super(spawnedBy, generator ?? Generator);
  }
}

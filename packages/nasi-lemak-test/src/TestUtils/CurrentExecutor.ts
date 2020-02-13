/**
 * CurrentExecutor.ts
 * @author Diao Zheng
 * @file Current running executor.
 */

// @barrel ignore

import { RootEffectChain, SideEffectChain } from "../EffectChains";

let currentExecutor: SideEffectChain | undefined;

export function __internal_getCurrentExecutor(): SideEffectChain {
  return currentExecutor ?? RootEffectChain.current;
}

export function __internal_setCurrentExecutor(
  executor?: SideEffectChain,
): SideEffectChain {
  const previousExecutor = currentExecutor;
  currentExecutor = executor;
  return previousExecutor ?? RootEffectChain.current;
}

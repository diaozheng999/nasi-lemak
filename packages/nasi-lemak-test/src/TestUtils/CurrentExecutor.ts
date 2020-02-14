/**
 * CurrentExecutor.ts
 * @author Diao Zheng
 * @file Updates the current executor in the hook context.
 */

// @barrel ignore

import { RootEffectChain, SideEffectChain } from "../EffectChains";

let currentExecutor: SideEffectChain | undefined;
let currentHookCount: number = 0;

export function __internal_getCurrentExecutor(): SideEffectChain {
  return currentExecutor ?? RootEffectChain.current;
}

export function __internal_setCurrentExecutor(
executor?: SideEffectChain,
): SideEffectChain | undefined {
  const previousExecutor = currentExecutor;
  currentExecutor = executor;
  return previousExecutor;
}

export function __internal_incrementCurrentHookCount() {
  ++currentHookCount;
}

export function __internal_resetCurrentHookCount(): number {
  const count = currentHookCount;
  currentHookCount = 0;
  return count;
}

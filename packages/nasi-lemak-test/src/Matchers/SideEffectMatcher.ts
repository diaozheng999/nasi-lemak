/**
 * SideEffectMatcher.ts
 * @author Diao Zheng
 * @file Side Effect Matchers
 */

// @barrel export all

import { SideEffect } from "../Effects";

export interface ISideEffectMatchers extends jest.Matchers<void, SideEffect> {
  not: ISideEffectMatchers;
  /** implemented by SideEffectChainMatcher.ts */
  toBeCompleted(): void;
}

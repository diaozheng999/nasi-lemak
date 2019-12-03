/**
 * Attach.ts
 * @author Diao Zheng
 * @file Attaches custom matchers to jest
 */

import { SideEffectChain } from "../EffectChains";
import { SideEffect } from "../Effects";
import { Duration } from "../Utils";

import {
  IDurationMatchers,
  toBeImmediate,
} from "./DurationMatcher";
import {
  ISideEffectChainMatchers,
  toBeCompleted,
  toBePersistent,
  toBeSpawnedBy,
  toBeStarted,
} from "./SideEffectChainMatcher";
import { ISideEffectMatchers } from "./SideEffectMatcher";

export function Attach() {
  expect.extend({
    toBeCompleted,
    toBeImmediate,
    toBePersistent,
    toBeSpawnedBy,
    toBeStarted,
  });
}

declare global {
  namespace jest {
    // tslint:disable-next-line: interface-name
    interface Expect {
      (actual: SideEffectChain): ISideEffectChainMatchers;
      (actual: SideEffect): ISideEffectMatchers;
      (actual: Duration.Type): IDurationMatchers;
    }
  }
}

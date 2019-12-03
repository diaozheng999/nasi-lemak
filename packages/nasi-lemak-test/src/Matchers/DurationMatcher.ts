/**
 * DurationMatcher.ts
 * @author Diao Zheng
 * @file Matchers for Durations
 */

// @barrel export all

import { Duration } from "../Utils";

import {
  EXPECTED_COLOR,
  matcherErrorMessage,
  matcherHint,
  printExpected,
  printReceived,
} from "jest-matcher-utils";
import { not } from "./Utils";

export interface IDurationMatchers extends jest.Matchers<void, Duration.Type> {
  not: IDurationMatchers;
  toBeImmediate(): void;
  toBeInstant(): void;
  toBeFrame(): void;
  toBeNextFrame(): void;
  toBeComposite(): void;
  toBeTimeout(): void;
  toBeWithin(lo: number, hi: number, fps?: number): void;
}

export function toBeImmediate(
  received: Duration.Type,
): jest.CustomMatcherResult {
  const pass = (
    received === Duration.IMMEDIATE ||
    (typeof received === "object" && received[Duration.IMMEDIATE] === true)
  );

  return {
    message: () => matcherErrorMessage(
      matcherHint("toBeImmediate", "received", "", { isNot: pass }),
      "",
      `Expected: ${not(pass, EXPECTED_COLOR)}` +
      `${printExpected(Duration.IMMEDIATE)}\n` +
      `Received: ${printReceived(received)}`,
    ),
    pass,
  };
}

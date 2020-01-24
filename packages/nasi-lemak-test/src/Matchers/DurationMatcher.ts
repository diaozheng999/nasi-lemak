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

function result(
  matcher: string,
  expected: Duration.Type,
  received: Duration.Type,
  pass: boolean,
) {
  return {
    message: () => matcherErrorMessage(
      matcherHint(matcher, "received", "", { isNot: pass }),
      "",
      `Expected: ${not(pass, EXPECTED_COLOR)}` +
      `${printExpected(expected)}\n` +
      `Received: ${printReceived(received)}`,
    ),
    pass,
  };
}

function test(
  matcher: string,
  expected: Duration.Type,
  received: Duration.Type,
) {
  const pass = (received === expected);
  return result(matcher, expected, received, pass);
}

export function toBeImmediate(
  received: Duration.Type,
): jest.CustomMatcherResult {
  const pass = (
    received === Duration.IMMEDIATE ||
    (typeof received === "object" && received[Duration.IMMEDIATE] === true)
  );

  return result("toBeImmediate", Duration.IMMEDIATE, received, pass);
}

export function toBeNextFrame(
  received: Duration.Type,
): jest.CustomMatcherResult {
  return test("toBeNextFrame", Duration.NEXT_FRAME, received);
}

export function toBeInstant(
  received: Duration.Type,
): jest.CustomMatcherResult {
  return test("toBeInstant", Duration.INSTANT, received);
}

export function toBeFrame(
  received: Duration.Type,
): jest.CustomMatcherResult {
  return test("toBeFrame", Duration.FRAME, received);
}

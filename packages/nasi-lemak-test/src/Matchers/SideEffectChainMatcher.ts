/**
 * SideEffectChainMatcher.ts
 * @author Diao Zheng
 * @file Jest matcher for SideEffectChains
 */

// @barrel export all

import {
  EXPECTED_COLOR,
  matcherErrorMessage,
  matcherHint,
  MatcherHintOptions,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
} from "jest-matcher-utils";
import { Option } from "nasi-lemak";
import { SideEffectChain } from "../EffectChains";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { not } from "./Utils";

export interface ISideEffectChainMatchers
extends jest.Matchers<void, SideEffectChain> {
  not: ISideEffectChainMatchers;
  toBeStarted(): void;
  toBeCompleted(): void;
  toBeSpawnedBy(expected: IDescribable, deep?: boolean): void;
  toBePersistent(): void;
}

function ensureIsSideEffectChain(
  received: SideEffectChain,
  matcherName: string,
  options?: MatcherHintOptions,
) {
  if (!(received instanceof SideEffectChain)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, "", options),
        RECEIVED_COLOR("received") +
        " value must be an instance of SideEffectChain",
        printWithType("Received", received, printReceived),
      ),
    );
  }
}

function ensureIsSideEffectOrSideEffectChain(
  received: SideEffectChain | SideEffect,
  matcherName: string,
  options?: MatcherHintOptions,
) {
  if (!(
    received instanceof SideEffectChain ||
    received instanceof SideEffect
  )) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, "", options),
        RECEIVED_COLOR("received") +
        " value must be an instance of SideEffectChain or SideEffect",
        printWithType("Received", received, printReceived),
      ),
    );
  }
}

export function toBeCompleted(
  received: SideEffectChain | SideEffect,
): jest.CustomMatcherResult {
  ensureIsSideEffectOrSideEffectChain(received, "toBeCompleted");
  const pass = received.isCompleted();
  return {
    message: () => matcherErrorMessage(
      matcherHint("toBeExecuted", received.getId(), "", { isNot: pass }),
      `Expected ${RECEIVED_COLOR(received.getId())} to ` +
      not(pass, EXPECTED_COLOR) + "be " +
      `${EXPECTED_COLOR("completed")}. However, it is ` +
      not(!pass, RECEIVED_COLOR) + RECEIVED_COLOR("completed") + ".",
      received.describe(""),
    ),
    pass,
  };
}

export function toBeStarted(
  received: SideEffectChain,
): jest.CustomMatcherResult {
  ensureIsSideEffectChain(received, "toBeStarted");
  const pass = received.isStarted();
  return {
    message: () => matcherErrorMessage(
      matcherHint("toBeStarted", received.getId(), "", { isNot: pass }),
      `Expected ${RECEIVED_COLOR(received.getId())} to ` +
      not(pass, EXPECTED_COLOR) + "be " +
      `${EXPECTED_COLOR("started")}. However, it is ` +
      not(!pass, RECEIVED_COLOR) + RECEIVED_COLOR("started") + ".",
      received.describe(""),
    ),
    pass,
  };
}

function performOwnershipCheck(
  received: IDescribable,
  expected: IDescribable,
  deep: boolean = true,
) {
  if (!deep) {
    return received?.owner() === expected;
  }
  for (let i = received.owner(); Option.isSome(i); i = i.owner()) {
    if (i === expected) {
      return true;
    }
  }
  return false;
}

export function toBeSpawnedBy(
  received: SideEffectChain,
  expected: IDescribable,
  deep: boolean = true,
): jest.CustomMatcherResult {
  ensureIsSideEffectChain(received, "toBeSpawnedBy");

  const pass = performOwnershipCheck(received, expected, deep);

  return {
    message: () => matcherErrorMessage(
      matcherHint(
        "toBeSpawnedBy",
        received.getId(),
        expected.getId() + ", deep=" + (deep ? "true" : "false"),
        { isNot: pass },
      ),
      `Expected ${RECEIVED_COLOR(received.getId())} to ` +
      `${not(pass, EXPECTED_COLOR)}be spawned by ` +
      `${EXPECTED_COLOR(expected.getId())}. However, it is spawned by ` +
      `${RECEIVED_COLOR(received.owner()?.getId())}.`,
      received.describe("", false),
    ),
    pass,
  };
}

export function toBePersistent(
  received: SideEffectChain,
): jest.CustomMatcherResult {
  ensureIsSideEffectChain(received, "toBePersistent");
  const pass = received.isPersistent();

  return {
    message: () => matcherErrorMessage(
      matcherHint("toBePersistent", received.getId(), "", { isNot: pass }),
      `Expected ${RECEIVED_COLOR(received.getId())} to ` +
      `${not(pass, EXPECTED_COLOR)}be ${EXPECTED_COLOR("persistent")}. ` +
      `However, it is ${not(!pass, RECEIVED_COLOR)}` +
      `${RECEIVED_COLOR("persistent")}.`,
      received.describe("", false),
    ),
    pass,
  };
}

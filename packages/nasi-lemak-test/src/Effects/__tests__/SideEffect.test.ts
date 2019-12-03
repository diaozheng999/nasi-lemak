/**
 * SideEffect.test.ts
 * @author Diao Zheng
 * @file Test cases for side effect
 */

// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@types/jest/index.d.ts" />

import { Contract } from "nasi";
import { SideEffect } from "../SideEffect";

beforeEach(() => {
  Contract.dismissContractMessages(
    /Precondition failed for SideEffect\.execute\./,
  );
});

afterEach(() => {
  Contract.restoreContractMessages();
});

test("side effects should not execute prematurely", () => {
  const effect = jest.fn();

  const sideEffect = new SideEffect(effect);

  expect(effect).not.toBeCalled();

  expect(sideEffect.isCompleted()).toBe(false);
  sideEffect.execute();

  expect(sideEffect.isCompleted()).toBe(true);
  expect(effect).toBeCalledTimes(1);
});

test("side effects should not be executed twice", () => {
  const effect = jest.fn();

  const sideEffect = new SideEffect(effect);

  sideEffect.execute();

  expect(() => sideEffect.execute()).toThrow();
});

test("toString should state the difference between completed and not", () => {
  const sideEffect = new SideEffect(jest.fn());

  const before = sideEffect.toString();
  sideEffect.execute();
  const after = sideEffect.toString();

  expect(before).not.toStrictEqual(after);
});

test("describe with prefix", () => {
  const prefix = "abcdefgh";
  const sideEffect = new SideEffect(jest.fn());

  const description = sideEffect.describe(prefix);
  expect(description).not.toMatch(/^abcdefgh<SideEffect/);
});

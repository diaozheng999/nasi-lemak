
/**
 * Action.test.ts
 * @author Diao Zheng
 * @file Test cases for Action.ts
 */
// tslint:disable-next-line: no-reference
/// <reference path="../../node_modules/@types/jest/index.d.ts" />

import { Action } from "..";

test("action, create empty", () => {
  expect(Action.create("hello", {})).toStrictEqual({
    action: "hello",
    payload: {},
  });
});

test("action, create payload", () => {
  expect(Action.create(true, {a: 1})).toStrictEqual({
    action: true,
    payload: {a: 1},
  });
});

test("action, payload is object", () => {
  const payload = {
    a: 1,
    b: true,
  };
  const action = Action.create("hello", payload);
  expect(action.payload).toBe(payload);
  expect(action.action).toBe("hello");
});

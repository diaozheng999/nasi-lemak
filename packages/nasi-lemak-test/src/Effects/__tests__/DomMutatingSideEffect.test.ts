/**
 * DomMutatingSideEffect.test.ts
 * @author Diao Zheng
 */

import { act } from "react-test-renderer";
import { DomMutatingSideEffect } from "../DomMutatingSideEffect";

import { Attach } from "../../Matchers";

Attach();

jest.mock("react-test-renderer", () => {
  const actual = jest.requireActual("react-test-renderer");
  return {...actual, act: jest.fn((e) => e()) };
});

test("renderer.act is called", () => {
  const effect = jest.fn();
  const action = new DomMutatingSideEffect(effect);

  action.execute();

  expect(act).toBeCalled();
  expect(effect).toBeCalled();
});

test("test", () => {
  const action = new DomMutatingSideEffect(jest.fn());
  expect(action.getDuration()).toBeNextFrame();
});
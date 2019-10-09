/**
 * Dispatch.test.tsx
 * @author Diao Zheng
 * @file tests for dispatch...
 */

import React from "react";
import renderer from "react-test-renderer";
import { Component } from "../Component";
import { Dispatch } from "../Dispatch";
import * as Intent from "../Intent";
import * as RuntimeUtilities from "../RuntimeUtilities";

jest.useFakeTimers();

interface IState {
  key: string;
}

class TestComponent
extends Component<{}, IState, Intent.Type<IState>, Intent.Type<IState>>
{
  public render() {
    return React.createElement("TestElement", {
      state: this.state,
    });
  }

  protected reducer(__: IState, action: Intent.Type<IState>) {
    return action;
  }
}

test("dispatch not yet mounted", () => {
  const ref = React.createRef<TestComponent>();
  const dispatch = Dispatch(ref);

  const testEffect = jest.fn();

  dispatch(Intent.SideEffects(async () => testEffect()));
  jest.runAllTicks();
  jest.runAllTimers();

  expect(testEffect).not.toBeCalled();
});

test("dispatch mounted", () => {
  const ref = React.createRef<TestComponent>();
  const dispatch = Dispatch(ref);

  const testEffect = jest.fn();

  const tree = RuntimeUtilities.createRenderer(<TestComponent ref={ref} />);

  dispatch(Intent.SideEffects(async () => testEffect()));
  jest.runAllTicks();
  jest.runAllTimers();

  expect(testEffect).toBeCalled();
  renderer.act(() => {
    tree.unmount();
  });
});

test("dispatch unmounted", () => {
  const ref = React.createRef<TestComponent>();
  const dispatch = Dispatch(ref);

  const testEffect = jest.fn();

  const tree = RuntimeUtilities.createRenderer(<TestComponent ref={ref} />);

  renderer.act(() => {
    tree.unmount();
  });

  dispatch(Intent.SideEffects(async () => testEffect()));
  jest.runAllImmediates();

  expect(testEffect).not.toBeCalled();
});

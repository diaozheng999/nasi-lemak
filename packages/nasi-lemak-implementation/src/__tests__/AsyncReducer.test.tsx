/**
 * AsyncReducer.test.tsx
 * @author Diao Zheng
 * @file Test cases for useAsyncReducer hook, This should cover at least the
 * scenarios of `Core/Redux/__tests__/Component.test.tsx`
 */

import { Intent } from "nasi-lemak-react-types";
import React from "react";
import renderer from "react-test-renderer";
import { useAsyncReducer } from "../AsyncReducer";
import * as RuntimeUtilities from "../RuntimeUtilities";

jest.useFakeTimers();

const mockRender = jest.fn();

interface IState {
  key: string;
  key2?: string;
}

function TestComponent() {
  mockRender();
  const [ state, dispatch ] = useAsyncReducer<
    IState,
    Intent.Type<IState>,
    Intent.Type<IState>
  >((_, a) => a, { key: "initial value" });

  return React.createElement("TestElement", {
    dispatch,
    state,
  });
}

beforeEach(() => {
  mockRender.mockReset();
});

test("noupdate", () => {
  const tree = RuntimeUtilities.createRenderer(<TestComponent />);
  const component = tree.root.findByType("TestElement" as any);

  const { dispatch } = component.props;
  renderer.act(() => {
    dispatch(Intent.NoUpdate());
  });
  jest.runAllTimers();
  expect(mockRender).toBeCalledTimes(1);
});

test("update", () => {
  const tree = RuntimeUtilities.createRenderer(<TestComponent />);
  const component = tree.root.findByType("TestElement" as any);

  const { dispatch } = component.props;
  renderer.act(() => {
    dispatch(Intent.Update({ key2: "harro" }));
  });
  jest.runAllTimers();
  expect(mockRender).toBeCalledTimes(2);

  const component2 = tree.root.findByType("TestElement" as any);
  expect(component2.props.state).toStrictEqual({
    key: "initial value",
    key2: "harro",
  });
});

test("side effects", () => {
  const effectStarted = jest.fn();
  const effectCompleted = jest.fn();
  const effect = (state: IState) => {
    effectStarted();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(state.key2).toBeUndefined();
        effectCompleted(state);
        resolve();
      }, 1000);
    });
  };

  const tree = RuntimeUtilities.createRenderer(<TestComponent />);
  const component = tree.root.findByType("TestElement" as any);

  const { dispatch } = component.props;
  renderer.act(() => {
    dispatch(Intent.SideEffects(effect));
  });
  expect(effectStarted).not.toBeCalled();
  expect(effectCompleted).not.toBeCalled();
  expect(mockRender).toBeCalledTimes(1);
  jest.runAllImmediates();
  jest.runTimersToTime(100);
  expect(effectStarted).toBeCalled();
  expect(effectCompleted).not.toBeCalled();
  jest.runAllTimers();
  expect(effectCompleted).toBeCalled();
});

test("update with side effects", () => {
  const effectStarted = jest.fn();
  const effectCompleted = jest.fn();
  const effect = (state: IState) => {
    effectStarted();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(state.key2).toBeUndefined();
        effectCompleted(state);
        resolve();
      }, 1000);
    });
  };

  const tree = RuntimeUtilities.createRenderer(<TestComponent />);
  const component = tree.root.findByType("TestElement" as any);

  const { dispatch } = component.props;
  renderer.act(() => {
    dispatch(Intent.UpdateWithSideEffects({ key2: "hello" }, effect));
  });
  expect(effectStarted).not.toBeCalled();
  expect(effectCompleted).not.toBeCalled();
  expect(mockRender).toBeCalledTimes(2);
  jest.runAllImmediates();
  jest.runTimersToTime(100);
  expect(effectStarted).toBeCalledTimes(1);
  expect(effectCompleted).not.toBeCalled();
  jest.runAllTimers();
  expect(effectCompleted).toBeCalledTimes(1);
});

test("dispatch after unmount", () => {

  const tree = RuntimeUtilities.createRenderer(<TestComponent />);
  const component = tree.root.findByType("TestElement" as any);

  const { dispatch } = component.props;

  renderer.act(() => {
    tree.unmount();
  });

  renderer.act(() => {
    dispatch(Intent.Update({ key2: "harro" }));
  });

  jest.runAllTimers();
  expect(mockRender).toBeCalledTimes(1);
});

test("side effects after unmount", () => {
  const effectStarted = jest.fn();
  const effectCompleted = jest.fn();
  const effect = (state: IState) => {
    effectStarted();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(state.key2).toBeUndefined();
        effectCompleted(state);
        resolve();
      }, 1000);
    });
  };

  const tree = RuntimeUtilities.createRenderer(<TestComponent />);
  const component = tree.root.findByType("TestElement" as any);

  const { dispatch } = component.props;
  renderer.act(() => {
    tree.unmount();
  });
  renderer.act(() => {
    dispatch(Intent.SideEffects(effect));
  });
  expect(mockRender).toBeCalledTimes(1);
  jest.runAllImmediates();
  jest.runAllTimers();
  expect(effectStarted).not.toBeCalled();
  expect(effectCompleted).not.toBeCalled();
});

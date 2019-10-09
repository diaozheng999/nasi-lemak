/**
 * Async.test.tsx
 * @author Diao Zheng
 * @file test cases for useAsync hook
 */

/// <reference types="jest" />

import React, { useEffect, useState } from "react";
import renderer from "react-test-renderer";
import { useAsyncLegacy as useAsync } from "../AsyncLegacy";
import * as RuntimeUtilities from "../RuntimeUtilities";

jest.useFakeTimers();

function AsyncComponent<
  TArgs extends any[],
  TResolution,
>(props: {
  promise: (...args: TArgs) => Promise<TResolution>;
  args: TArgs;
  onResolve: (result: TResolution | undefined) => void;
  rerender?: number;
}) {
  const resolution = useAsync(props.promise, props.args);
  useEffect(() => {
    props.onResolve(resolution);
  }, [resolution]);
  return null;
}

function AsyncComponentWithDependencies<
  TArgs extends any[],
  TResolution,
>(props: {
  promise: (...args: TArgs) => Promise<TResolution>;
  args: TArgs;
  onResolve: (result: TResolution | undefined) => void;
  rerender?: number;
}) {

  const [ dep, dispatch ] = useState(0);

  const resolution = useAsync(props.promise, props.args, [ dep ]);
  useEffect(() => {
    props.onResolve(resolution);
  }, [resolution]);
  return React.createElement("AsyncComponent", { dispatch });
}

test("async function should not matter if component unmounted", () => {

  const onResolve = jest.fn();

  const promise = (a: number) => new Promise<number>((resolve) => {
    setTimeout(() => resolve(a), 1000);
  });

  const tree = RuntimeUtilities.createRenderer(
    <AsyncComponent
      promise={promise}
      args={[2] as [number]}
      onResolve={onResolve}
    />,
  );

  renderer.act(() => {
    tree.unmount();
  });

  renderer.act(() => {
    jest.runAllTimers();
  });

  expect(onResolve).toBeCalledTimes(1);
  expect(onResolve.mock.calls[0][0]).toBeUndefined();
});

test("async function do not rerender unless absolutely necessary", () => {

  const onResolve = jest.fn();

  const promise = jest.fn((a: number) => new Promise<number>((resolve) => {
    setTimeout(() => resolve(a), 1000);
  }));

  const tree = RuntimeUtilities.createRenderer(
    <AsyncComponent
      promise={promise}
      args={[2] as [number]}
      onResolve={onResolve}
      rerender={0}
    />,
  );

  renderer.act(() => {
    tree.update(
      <AsyncComponent
        promise={promise}
        args={[2] as [number]}
        onResolve={onResolve}
        rerender={1}
      />,
    );
  });

  renderer.act(() => {
    tree.update(
      <AsyncComponent
        promise={promise}
        args={[2] as [number]}
        onResolve={onResolve}
        rerender={2}
      />,
    );
  });

  renderer.act(() => {
    tree.update(
      <AsyncComponent
        promise={promise}
        args={[2] as [number]}
        onResolve={onResolve}
        rerender={3}
      />,
    );
  });

  renderer.act(() => {
    jest.runAllTimers();
  });
  renderer.act(() => {
    tree.unmount();
  });

  // here we test the conditional firing of `useAsync`, where it is only fired
  // when the input function changes.
  expect(promise).toBeCalledTimes(1);
  expect(onResolve.mock.calls[0][0]).toBeUndefined();
});

test("async function conditional firing", () => {

  const onResolve = jest.fn();

  const promise = jest.fn((a: number, b: number) => {
    return new Promise<number>((resolve) => {
      setTimeout(() => resolve(a + b), 1000);
    });
  });

  const tree = RuntimeUtilities.createRenderer(
    <AsyncComponent
      promise={promise}
      args={[2, 3] as [number, number]}
      onResolve={onResolve}
      rerender={0}
    />,
  );

  renderer.act(() => {
    tree.update(
      <AsyncComponent
        promise={promise}
        args={[2, 3] as [number, number]}
        onResolve={onResolve}
        rerender={1}
      />,
    );
  });

  renderer.act(() => {
    jest.runAllTimers();
  });

  expect(promise).toBeCalledTimes(1);

  renderer.act(() => {
    tree.update(
      <AsyncComponent
        promise={promise}
        args={[2, 4] as [number, number]}
        onResolve={onResolve}
        rerender={1}
      />,
    );
  });

  renderer.act(() => {
    jest.runAllTimers();
  });

  expect(promise).toBeCalledTimes(2);

  renderer.act(() => {
    tree.update(
      <AsyncComponent
        promise={promise}
        args={[3, 5] as [number, number]}
        onResolve={onResolve}
        rerender={1}
      />,
    );
  });

  renderer.act(() => {
    jest.runAllTimers();
  });

  expect(promise).toBeCalledTimes(3);

  renderer.act(() => {
    tree.unmount();
  });

});

test("async function conditional firing additional dependencies", () => {

  const onResolve = jest.fn();

  const promise = jest.fn((a: number, b: number) => {
    return new Promise<number>((resolve) => {
      setTimeout(() => resolve(a + b), 1000);
    });
  });

  const tree = RuntimeUtilities.createRenderer(
    <AsyncComponentWithDependencies
      promise={promise}
      args={[2, 3] as [number, number]}
      onResolve={onResolve}
      rerender={0}
    />,
  );

  renderer.act(() => {
    tree.update(
      <AsyncComponentWithDependencies
        promise={promise}
        args={[2, 3] as [number, number]}
        onResolve={onResolve}
        rerender={1}
      />,
    );
  });

  renderer.act(() => {
    jest.runAllTimers();
  });

  expect(promise).toBeCalledTimes(1);

  const element = tree.root.findByType("AsyncComponent" as any);

  renderer.act(() => {
    element.props.dispatch(1);
  });

  renderer.act(() => {
    jest.runAllTimers();
  });
  expect(promise).toBeCalledTimes(2);

});

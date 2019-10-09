/**
 * IsMounted.test.tsx
 * @author Diao Zheng
 * @file test cases for useIsMounted hook
 */

import React, { useEffect } from "react";
import renderer from "react-test-renderer";
import { useIsMounted } from "../IsMounted";
import * as RuntimeUtilities from "../RuntimeUtilities";

jest.useFakeTimers();

function TestIsMounted(props: {
  executeIfMounted: jest.Mock;
  executeIfUnmounted: jest.Mock;
}) {
  const isMounted = useIsMounted();
  useEffect(() => {
    setTimeout(() => {
      if (isMounted()) {
        props.executeIfMounted();
      } else {
        props.executeIfUnmounted();
      }
    }, 1000);
  });

  return React.createElement("TestIsMounted", {
    ...props,
    isMounted,
  });
}

test("when async function returns if still mounted", () => {
  const executeIfMounted = jest.fn();
  const executeIfUnmounted = jest.fn();

  const tree = RuntimeUtilities.createRenderer(
    <TestIsMounted
      executeIfMounted={executeIfMounted}
      executeIfUnmounted={executeIfUnmounted}
    />,
  );

  renderer.act(() => {
    jest.runAllTimers();
  });

  renderer.act(() => {
    tree.update(<></>);
  });

  expect(setTimeout).toBeCalled();

  expect(executeIfMounted).toBeCalledTimes(1);
  expect(executeIfUnmounted).toBeCalledTimes(0);
});

test("when async function returns if unmounted", () => {
  const executeIfMounted = jest.fn();
  const executeIfUnmounted = jest.fn();

  const tree = RuntimeUtilities.createRenderer(
    <TestIsMounted
      executeIfMounted={executeIfMounted}
      executeIfUnmounted={executeIfUnmounted}
    />,
  );

  renderer.act(() => {
    tree.update(<></>);
  });

  renderer.act(() => {
    jest.runAllTimers();
  });

  expect(setTimeout).toBeCalled();

  expect(executeIfMounted).toBeCalledTimes(0);
  expect(executeIfUnmounted).toBeCalledTimes(1);
});

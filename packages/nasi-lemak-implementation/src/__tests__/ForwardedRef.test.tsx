/**
 * ForwardedRef.test.tsx
 * @author Diao Zheng
 * @file Testing forwarded refs....
 */

import React from "react";
import renderer from "react-test-renderer";
import { useForwardedRef } from "../ForwardedRef";
import * as RuntimeUtilities from "../RuntimeUtilities";

class View extends React.Component<any> {
  public render() {
    return React.createElement("RCTView", this.props);
  }
}

function TestComponent__(__: {}, ref: React.Ref<any>) {
  const forwardedRef = useForwardedRef(ref);
  return <View ref={forwardedRef} />;
}

const TestComponent = React.forwardRef(TestComponent__);

test("ref ref", () => {
  const ref = React.createRef<any>();

  const tree = RuntimeUtilities.createRenderer(<TestComponent ref={ref} />);

  const element = tree.root.findByType(View).instance;

  expect(element).not.toBe(null);

  expect(ref.current).toBe(element);
});

test("ref callback", () => {
  const ref = jest.fn();

  const tree = RuntimeUtilities.createRenderer(<TestComponent ref={ref} />);

  const element = tree.root.findByType(View).instance;

  expect(element).not.toBe(null);
  expect(ref).toBeCalledTimes(2);
  expect(ref.mock.calls[0][0]).toBe(null);
  expect(ref.mock.calls[1][0]).toBe(element);

});

test("ref ref update", () => {
  const ref = React.createRef<any>();

  const tree = RuntimeUtilities.createRenderer(
    <TestComponent ref={ref} key={0} />,
  );

  const element = tree.root.findByType(View).instance;

  expect(element).not.toBe(null);
  expect(ref.current).toBe(element);

  renderer.act(() => {
    tree.update(<TestComponent ref={ref} key={1} />);
  });

  const element1 = tree.root.findByType(View).instance;

  expect(element1).not.toBe(null);
  expect(element1).not.toBe(element);
  expect(ref.current).toBe(element1);
  expect(ref.current).not.toBe(element);
});

test("ref callback update", () => {
  const ref = jest.fn();

  const tree = RuntimeUtilities.createRenderer(
    <TestComponent ref={ref} key={0} />,
  );

  const element = tree.root.findByType(View).instance;

  expect(element).not.toBe(null);
  expect(ref).toBeCalledTimes(2);
  expect(ref.mock.calls[0][0]).toBe(null);
  expect(ref.mock.calls[1][0]).toBe(element);

  renderer.act(() => {
    tree.update(<TestComponent ref={ref} key={1} />);
  });

  const element1 = tree.root.findByType(View).instance;
  expect(element1).not.toBe(null);
  expect(element1).not.toBe(element);

  expect(ref).toBeCalledTimes(4);
  expect(ref.mock.calls[2][0]).toBe(null);
  expect(ref.mock.calls[3][0]).toBe(element1);
});

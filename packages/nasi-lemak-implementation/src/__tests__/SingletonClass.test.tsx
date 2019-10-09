/**
 * SingletonClass.test.tsx
 * @author Diao Zheng
 * @file test cases for the useSingletonClass hook
 */

import React from "react";
import renderer from "react-test-renderer";
import * as RuntimeUtilities from "../RuntimeUtilities";
import { useSingletonClass } from "../SingletonClass";

jest.useFakeTimers();

class MyClass {
  public car: number;
  public cdr: number;
  constructor(a: number, b: number) {
    this.car = a;
    this.cdr = b;
  }
}

function TestComponent(props: {
  car: number;
  cdr: number;
  updateProp: any;
}) {

  const cls = useSingletonClass(MyClass, props.car, props.cdr);

  return React.createElement("TestElement", {
    singleton: cls,
    updateProp: props.updateProp,
  });
}

test("constructor", () => {
  const tree = RuntimeUtilities.createRenderer(
    <TestComponent car={0} cdr={1} updateProp={0}/>,
  );

  jest.runAllTimers();

  const result = tree.root.findByType("TestElement" as any).props;

  expect(result.singleton).toBeInstanceOf(MyClass);
  expect(result.singleton.car).toBe(0);
  expect(result.singleton.cdr).toBe(1);
});

test("constructor updates", () => {
  const tree = RuntimeUtilities.createRenderer(
    <TestComponent car={0} cdr={1} updateProp={0}/>,
  );

  jest.runAllTimers();

  const result = tree.root.findByType("TestElement" as any).props;
  const singleton0 = result.singleton;

  renderer.act(() => {
    tree.update(<TestComponent car={0} cdr={1} updateProp={1} />);
  });

  jest.runAllTimers();

  expect(result.singleton).toBe(singleton0);
});

test("constructor update prop", () => {
  const tree = RuntimeUtilities.createRenderer(
    <TestComponent car={0} cdr={1} updateProp={0}/>,
  );

  jest.runAllTimers();

  const result = tree.root.findByType("TestElement" as any).props;
  const singleton0 = result.singleton;

  renderer.act(() => {
    tree.update(<TestComponent car={0} cdr={2} updateProp={0} />);
  });

  jest.runAllTimers();
  const result1 = tree.root.findByType("TestElement" as any).props;

  expect(result1.singleton).not.toBe(singleton0);
  expect(result1.singleton.car).toBe(0);
  expect(result1.singleton.cdr).toBe(2);
});

test("constructor update prop back", () => {
  const tree = RuntimeUtilities.createRenderer(
    <TestComponent car={0} cdr={1} updateProp={0}/>,
  );

  jest.runAllTimers();

  const result = tree.root.findByType("TestElement" as any).props;
  const singleton0 = result.singleton;

  renderer.act(() => {
    tree.update(<TestComponent car={0} cdr={2} updateProp={0} />);
  });

  jest.runAllTimers();
  const result1 = tree.root.findByType("TestElement" as any).props;

  expect(result1.singleton).not.toBe(singleton0);

  renderer.act(() => {
    tree.update(<TestComponent car={0} cdr={1} updateProp={0} />);
  });

  jest.runAllTimers();
  const result2 = tree.root.findByType("TestElement" as any).props;

  expect(result2.singleton).not.toBe(singleton0);
  expect(result2.singleton).not.toBe(result1.singleton);
});

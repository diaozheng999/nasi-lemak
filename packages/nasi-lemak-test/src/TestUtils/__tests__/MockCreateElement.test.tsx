/**
 * MockCreateElement.test.ts
 * @author Diao Zheng
 * @file Tests to make sure React components are created properly
 */

// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@types/jest/index.d.ts" />

import renderer from "react-test-renderer";
import { MockCreateElement } from "../MockCreateElement";

jest.doMock("react", () => {
  const ReactActual = jest.requireActual("react");
  return {
    ...ReactActual,
    createElement: MockCreateElement(ReactActual),
  };
});

import React, { Suspense } from "react";

class TestClassComponent extends React.Component<any> {
  public render() {
    return React.createElement("__builtin__", this.props);
  }
}

function TestFunctionComponent() {
  return React.createElement("__builtin__", {});
}

function fetcher() {
  return {
    read() {
      return 5;
    },
  };
}

const resource = fetcher();

function TestAsyncComponent() {
  const p = resource.read();
  return <TestClassComponent value={p} />;
}

const TestContext = React.createContext("TestContext");

const TestExoticComponent = React.forwardRef(
  (props, ref: React.Ref<TestClassComponent>) => {
    return <TestClassComponent {...props} ref={ref} />;
  },
);

test("function component", () => {
  const tree = renderer.create(<TestFunctionComponent />);
  expect(tree.toJSON()).toMatchSnapshot();
});

test("class component", () => {
  const tree = renderer.create(<TestClassComponent />);
  expect(tree.toJSON()).toMatchSnapshot();
});

test("builtin", () => {
  const tree = renderer.create(<h6 />);
  expect(tree.toJSON()).toMatchSnapshot();
});

test("context producer", () => {
  const tree = renderer.create(
    <TestContext.Provider value="boo">
      <TestFunctionComponent />
    </TestContext.Provider>,
  );
  expect(tree.toJSON()).toMatchSnapshot();
});

test("context consumer", () => {
  const tree = renderer.create(
    <TestContext.Consumer>
      {(val) => <TestClassComponent value={val} />}
    </TestContext.Consumer>,
  );
  expect(tree.toJSON()).toMatchSnapshot();
});

test("fragment", () => {
  const tree = renderer.create(
    <>
      <TestFunctionComponent />
      <TestClassComponent />
    </>,
  );
  expect(tree.toJSON()).toMatchSnapshot();
});

test("exotic", () => {
  const tree = renderer.create(<TestExoticComponent />);
  expect(tree.toJSON()).toMatchSnapshot();
});

test("suspense", () => {
  const tree = renderer.create(
    <Suspense fallback={<h1/>}>
      <TestAsyncComponent />
    </Suspense>,
  );
  expect(tree.toJSON()).toMatchSnapshot();
});

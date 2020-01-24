/**
 * UseEffect.test.tsx
 * @author Diao Zheng
 * @file Testing UseEffect effect chains
 */

// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@types/jest/index.d.ts" />

import renderer from "react-test-renderer";
import { MockReact } from "../../MockReact";

jest.doMock("react", MockReact);

import React, { EffectCallback, useEffect } from "react";
import { RootEffectChain } from "../RootEffectChain";

function TestComponent(props: {
  rerenderCount: number,
  effect: EffectCallback,
}) {
  useEffect(props.effect, [ props.rerenderCount ]);
  return React.createElement("TestRender", props);
}

test("hello", () => {

  const actualEffect = jest.fn();
  const cleanupEffect = jest.fn();

  const effect = () => {
    actualEffect();
    return () => cleanupEffect();
  };

  const tree = renderer.create(
    <TestComponent rerenderCount={0} effect={effect} />,
  );

  RootEffectChain.current.execute();

  expect(actualEffect).toBeCalled();
  expect(cleanupEffect).not.toBeCalled();
  tree.unmount();
  RootEffectChain.current.execute();
  expect(cleanupEffect).toBeCalled();

});

test("update with cleanups on 1 step", () => {

  const actualEffect = jest.fn();
  const cleanupEffect = jest.fn();

  const effect = () => {
    actualEffect();
    return () => cleanupEffect();
  };

  const tree = renderer.create(
    <TestComponent rerenderCount={0} effect={effect} />,
  );

  RootEffectChain.current.execute();

  expect(actualEffect).toBeCalled();
  expect(cleanupEffect).not.toBeCalled();

  renderer.act(() => {
    tree.update(
      <TestComponent rerenderCount={1} effect={effect} />,
    );
  });

  expect(actualEffect).toBeCalledTimes(1);
  expect(cleanupEffect).not.toBeCalled();

  RootEffectChain.current.execute();

  expect(actualEffect).toBeCalledTimes(2);
  expect(cleanupEffect).toBeCalledTimes(1);

  tree.unmount();

  RootEffectChain.current.execute();

  expect(actualEffect).toBeCalledTimes(2);
  expect(cleanupEffect).toBeCalledTimes(2);

});

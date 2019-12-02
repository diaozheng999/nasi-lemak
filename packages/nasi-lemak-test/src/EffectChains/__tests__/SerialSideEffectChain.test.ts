/**
 * SerialSideEffectChain.test.ts
 * @author Diao Zheng
 * @file Test cases for a serial side effect chain.
 */

import { SideEffect } from "../../Effects";
import { SerialSideEffectChain } from "../SerialSideEffectChain";

test("simple effect execution", () => {
  const chain = new SerialSideEffectChain({
    describe: (prefix: string) => `${prefix}<test>`,
  });

  const action0 = jest.fn();
  const effect0 = new SideEffect(action0);

  const action1 = jest.fn();
  const effect1 = new SideEffect(action1);

  chain.enqueue(effect0);
  chain.enqueue(effect1);

  expect(action0).not.toBeCalled();
  expect(action1).not.toBeCalled();

  expect(action0).not.toBeCompleted();

  chain.execute();

});

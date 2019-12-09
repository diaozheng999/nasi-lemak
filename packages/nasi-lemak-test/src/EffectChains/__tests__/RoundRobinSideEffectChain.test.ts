/**
 * RoundRobinSideEffectChain.test.ts
 * @author Diao Zheng
 * @file Test cases for a round-robin side effect chain.
 */

import _ from "lodash";

import { SideEffect } from "../../Effects";
import { TestSpawner } from "../../Utils";
import { RoundRobinSideEffectChain } from "../RoundRobinSideEffectChain";
import { SerialSideEffectChain } from "../SerialSideEffectChain";

import { Attach } from "../../Matchers";

Attach();

test("round robinism", () => {
  const spawner = TestSpawner();

  const mainChain = new RoundRobinSideEffectChain(spawner);

  const childChain1 = new SerialSideEffectChain(mainChain);
  const childChain2 = new SerialSideEffectChain(mainChain);
  const childChain3 = new SerialSideEffectChain(mainChain);

  mainChain.enqueue(childChain1, childChain2, childChain3);

  const effect11 = new SideEffect(_.identity);
  const effect12 = new SideEffect(_.identity);
  const effect13 = new SideEffect(_.identity);

  const effect21 = new SideEffect(_.identity);
  const effect22 = new SideEffect(_.identity);

  const effect31 = new SideEffect(_.identity);
  const effect32 = new SideEffect(_.identity);
  const effect33 = new SideEffect(_.identity);

  childChain1.enqueue(effect11, effect12, effect13);
  childChain2.enqueue(effect21, effect22);
  childChain3.enqueue(effect31, effect32, effect33);

  mainChain.execute();

  expect(effect11).toBeCompleted();
  expect(effect21).not.toBeCompleted();
  expect(effect12).not.toBeCompleted();

  mainChain.execute();

  expect(effect21).toBeCompleted();
  expect(effect12).not.toBeCompleted();
  expect(effect31).not.toBeCompleted();

  mainChain.execute();

  expect(effect31).toBeCompleted();
  expect(effect22).not.toBeCompleted();
  expect(effect12).not.toBeCompleted();

  mainChain.execute();

  expect(effect12).toBeCompleted();
  expect(effect22).not.toBeCompleted();

  mainChain.execute();

  expect(effect22).toBeCompleted();
  expect(effect32).not.toBeCompleted();

  mainChain.execute();

  expect(effect32).toBeCompleted();
  expect(effect13).not.toBeCompleted();

  mainChain.execute();

  expect(effect13).toBeCompleted();

  mainChain.execute();

  expect(effect33).toBeCompleted();
  expect(mainChain).toBeCompleted();
});

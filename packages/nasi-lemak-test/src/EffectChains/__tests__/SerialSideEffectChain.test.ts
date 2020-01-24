/**
 * SerialSideEffectChain.test.ts
 * @author Diao Zheng
 * @file Test cases for a serial side effect chain.
 */

// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@types/jest/index.d.ts" />

import _ from "lodash";
import { Contract, Unique } from "nasi-lemak";
import { SideEffect } from "../../Effects";
import { TestSpawner } from "../../Utils";
import { SerialSideEffectChain } from "../SerialSideEffectChain";
import { SideEffectChain } from "../SideEffectChain";

import { Attach } from "../../Matchers";

Attach();

beforeEach(() => {
  Contract.dismissContractMessages(/SideEffectChain/);
  SideEffectChain.activePersistentChains.clear();
});

afterEach(() => {
  Contract.restoreContractMessages();
});

test("empty chains should be 1-step noop", () => {
  const spawner = TestSpawner();

  const chain = new SerialSideEffectChain(spawner);

  expect(chain).not.toBeCompleted();
  chain.execute();
  expect(chain).toBeCompleted();
});

test("should not be able to enqueue a completed chain", () => {
  const spawner = TestSpawner();
  const chain = new SerialSideEffectChain(spawner);
  chain.execute();
  expect(chain).toBeCompleted();

  expect(() => chain.enqueue(new SideEffect(_.identity))).toThrowError();
});

test("executing a completed chain should throw error", () => {
  const spawner = TestSpawner();

  const chain = new SerialSideEffectChain(spawner);

  expect(chain).not.toBeCompleted();
  chain.execute();
  expect(chain).toBeCompleted();

  expect(chain.execute).toThrowError();

});

test("simple effect execution", () => {

  const spawner = TestSpawner();

  const chain = new SerialSideEffectChain(spawner);

  expect(chain).toBeSpawnedBy(spawner);

  const effect0 = new SideEffect(_.identity);
  const effect1 = new SideEffect(_.identity);

  chain.enqueue(effect0);
  chain.enqueue(effect1);

  expect(effect0).not.toBeCompleted();
  expect(effect1).not.toBeCompleted();
  expect(chain).not.toBeCompleted();

  chain.execute();

  expect(effect0).toBeCompleted();
  expect(effect1).not.toBeCompleted();
  expect(chain).not.toBeCompleted();

  chain.execute();

  expect(effect0).toBeCompleted();
  expect(effect1).toBeCompleted();
  expect(chain).toBeCompleted();
});

test("nested effects should execute one after another", () => {
  const spawner = TestSpawner();
  const chain = new SerialSideEffectChain(spawner);
  const child1 = new SerialSideEffectChain(chain);
  const child2 = new SerialSideEffectChain(chain);

  chain.enqueue(child1);
  chain.enqueue(child2);

  // by default toBeSpawnedBy matches deep ownership
  expect(child1).toBeSpawnedBy(spawner);
  expect(child1).not.toBeStarted();
  expect(child2).not.toBeStarted();
  expect(chain).not.toBeStarted();

  chain.execute();

  expect(chain).toBeStarted();
  expect(chain).not.toBeCompleted();
  expect(child1).toBeCompleted();
  expect(child2).not.toBeStarted();

  chain.execute();

  expect(chain).toBeCompleted();
  expect(child1).toBeCompleted();
  expect(child2).toBeCompleted();

  expect(chain.execute).toThrowError();
});

describe("persistent side effect chains", () => {
  test("persistent should only complete when unmounted", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner, new Unique("T.T"), true);

    expect(SideEffectChain.activePersistentChains).toContain(chain);

    expect(chain).not.toBeStarted();

    chain.execute();
    expect(chain).toBePersistent();

    expect(chain).not.toBeCompleted();
    expect(chain.execute).not.toThrowError();

    chain.deactivate();
    expect(SideEffectChain.activePersistentChains).not.toContain(chain);

    chain.execute();

    expect(chain).toBeCompleted();
    expect(chain).toBePersistent();
  });

  test("tests will never loop", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner, new Unique("T.T"), true);

    expect(chain).not.toBeStarted();

    expect(() => {
      while (1) {
        chain.execute();
      }
    }).toThrowError();

    expect(SideEffectChain.activePersistentChains).toContain(chain);
  });

  test("can change to ephemeral when not completed", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner, new Unique("T.T"), true);
    chain.enqueue(new SideEffect(_.identity));
    expect(SideEffectChain.activePersistentChains).toContain(chain);

    chain.setPersistence(false);
    expect(SideEffectChain.activePersistentChains).not.toContain(chain);

    expect(chain).not.toBePersistent();

  });

  test("cannot change persistence completed", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner, new Unique("T.T"), true);
    chain.enqueue(new SideEffect(_.identity));

    chain.deactivate();
    chain.execute();

    expect(() => chain.setPersistence(false)).toThrowError();
  });

  test("deactivate can only be called on persistent effects", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    expect(chain.deactivate).toThrowError();
  });

  test("can always convert an ephemeral chain to persistent", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    expect(chain).not.toBePersistent();

    expect(SideEffectChain.activePersistentChains).not.toContain(chain);

    chain.setPersistence(true);
    expect(chain).toBePersistent();

    expect(SideEffectChain.activePersistentChains).toContain(chain);
  });

  test("updating persistence to a persistent chain results in noop", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner, new Unique("T.T"), true);

    chain.setPersistence(true);

    expect(SideEffectChain.activePersistentChains).toContain(chain);
    expect(chain).toBePersistent();
  });
});

describe("current effect", () => {
  test("in pending state, nothing", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    expect(chain.currentEffect()).toBeUndefined();
  });

  test("in executing state, return active effect", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    const effect0 = new SideEffect(_.identity);
    const effect = new SideEffect(_.identity);
    chain.enqueue(effect0, effect);
    chain.execute();
    expect(chain.currentEffect()).toBe(effect);
  });

  test("in executing state, empty effect chain", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    const child = new SerialSideEffectChain(chain);
    child.setPersistence(true);
    chain.enqueue(child);
    chain.execute();
    expect(chain.currentEffect()).toBeUndefined();
    expect(chain).toBeStarted();
  });

  test("in executing state, effect chain with stuff", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    const child = new SerialSideEffectChain(chain);
    const effect = new SideEffect(_.identity);
    child.setPersistence(true);
    child.enqueue(new SideEffect(_.identity), effect);
    chain.enqueue(child);
    chain.execute();
    expect(chain.currentEffect()).toBe(effect);
    expect(chain).toBeStarted();
  });

  test("in completed state, nothing", () => {
    const spawner = TestSpawner();
    const chain = new SerialSideEffectChain(spawner);
    chain.execute();
    expect(chain).toBeCompleted();
    expect(chain.currentEffect()).toBeUndefined();
  });

});

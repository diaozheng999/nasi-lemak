/**
 * PersistentCacheUpdateDelta.test.ts
 * @author Diao Zheng
 * @file test cases for pcache update delta
 */

import { PersistentCacheUpdateDelta } from "../PersistentCacheUpdateDelta";

test("remove", () => {
  const delta = new PersistentCacheUpdateDelta<string>();
  delta.addRemoveDelta("item");
  delta.addRemoveDelta("item"); // intentional

  const removes = Array.from(delta.getRemoves((k) => k));
  expect(removes).toStrictEqual(["item"]);

  const sets = Array.from(delta.getSets((k) => k));
  expect(sets).toStrictEqual([]);

  const newKeys = Array.from(delta.getNewKeys((k) => k));
  expect(newKeys).toStrictEqual([]);

  const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
  expect(removeKeys).toStrictEqual([]);
});

test("set", () => {
  const delta = new PersistentCacheUpdateDelta<string>();
  delta.addSetDelta("item", "value0");
  delta.addSetDelta("item", "value1"); // intentional

  const removes = Array.from(delta.getRemoves((k) => k));
  expect(removes).toStrictEqual([]);

  const sets = Array.from(delta.getSets((k) => k));
  expect(sets).toStrictEqual([["item", "value1"]]);

  const newKeys = Array.from(delta.getNewKeys((k) => k));
  expect(newKeys).toStrictEqual([]);

  const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
  expect(removeKeys).toStrictEqual([]);
});

test("newkey", () => {
  const delta = new PersistentCacheUpdateDelta<string>();
  delta.addNewKeyDelta("item");
  delta.addNewKeyDelta("item"); // intentional

  const removes = Array.from(delta.getRemoves((k) => k));
  expect(removes).toStrictEqual([]);

  const sets = Array.from(delta.getSets((k) => k));
  expect(sets).toStrictEqual([]);

  const newKeys = Array.from(delta.getNewKeys((k) => k));
  expect(newKeys).toStrictEqual(["item"]);

  const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
  expect(removeKeys).toStrictEqual([]);
});

test("removekey", () => {
  const delta = new PersistentCacheUpdateDelta<string>();
  delta.addRemoveKeyDelta("item");
  delta.addRemoveKeyDelta("item"); // intentional

  const removes = Array.from(delta.getRemoves((k) => k));
  expect(removes).toStrictEqual([]);

  const sets = Array.from(delta.getSets((k) => k));
  expect(sets).toStrictEqual([]);

  const newKeys = Array.from(delta.getNewKeys((k) => k));
  expect(newKeys).toStrictEqual([]);

  const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
  expect(removeKeys).toStrictEqual(["item"]);
});

test("all in", () => {
  const delta = new PersistentCacheUpdateDelta<string>();
  delta.addRemoveKeyDelta("item1");
  delta.addRemoveDelta("item2");
  delta.addNewKeyDelta("item3");
  delta.addSetDelta("item4", "value");

  const removes = Array.from(delta.getRemoves((k) => k));
  expect(removes).toStrictEqual(["item2"]);

  const sets = Array.from(delta.getSets((k) => k));
  expect(sets).toStrictEqual([["item4", "value"]]);

  const newKeys = Array.from(delta.getNewKeys((k) => k));
  expect(newKeys).toStrictEqual(["item3"]);

  const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
  expect(removeKeys).toStrictEqual(["item1"]);
});

describe("merge", () => {
  test("should modify left", () => {
    const left = new PersistentCacheUpdateDelta<string>();
    const right = new PersistentCacheUpdateDelta<string>();
    const merged = PersistentCacheUpdateDelta.mergeWith(left, right);
    expect(merged).toBe(left);
    expect(merged).not.toBe(right);
  });

  test("disjoint merge", () => {
    const left = new PersistentCacheUpdateDelta<string>();
    left.addRemoveKeyDelta("item1");
    left.addRemoveDelta("item2");
    const right = new PersistentCacheUpdateDelta<string>();
    right.addNewKeyDelta("item3");
    right.addSetDelta("item4", "value");
    const delta = PersistentCacheUpdateDelta.mergeWith(left, right);

    const removes = Array.from(delta.getRemoves((k) => k));
    expect(removes).toStrictEqual(["item2"]);

    const sets = Array.from(delta.getSets((k) => k));
    expect(sets).toStrictEqual([["item4", "value"]]);

    const newKeys = Array.from(delta.getNewKeys((k) => k));
    expect(newKeys).toStrictEqual(["item3"]);

    const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
    expect(removeKeys).toStrictEqual(["item1"]);
  });

  test("joint merge", () => {
    const left = new PersistentCacheUpdateDelta<string>();
    left.addRemoveKeyDelta("item1");
    left.addRemoveDelta("item2");
    left.addNewKeyDelta("item4");
    const right = new PersistentCacheUpdateDelta<string>();
    right.addNewKeyDelta("item3");
    right.addSetDelta("item4", "value"); // overwrites left
    const delta = PersistentCacheUpdateDelta.mergeWith(left, right);

    const removes = Array.from(delta.getRemoves((k) => k));
    expect(removes).toStrictEqual(["item2"]);

    const sets = Array.from(delta.getSets((k) => k));
    expect(sets).toStrictEqual([["item4", "value"]]);

    const newKeys = Array.from(delta.getNewKeys((k) => k));
    expect(newKeys).toStrictEqual(["item3"]);

    const removeKeys = Array.from(delta.getRemoveKeys((k) => k));
    expect(removeKeys).toStrictEqual(["item1"]);
  });
});

describe("render filter", () => {
  test("removes", () => {
    const delta = new PersistentCacheUpdateDelta<string>();
    delta.addRemoveDelta("item0");
    delta.addRemoveDelta("item1");
    delta.addRemoveDelta("item2");

    const removes = Array.from(
      delta.getRemoves((k) => k === "item0" ? k : undefined),
    );
    expect(removes).toStrictEqual(["item0"]);
  });
  test("sets", () => {
    const delta = new PersistentCacheUpdateDelta<string>();
    delta.addSetDelta("item0", "0");
    delta.addSetDelta("item1", "1");
    delta.addSetDelta("item2", "2");

    const sets = Array.from(
      delta.getSets((k) => k === "item2" ? k : undefined),
    );
    expect(sets).toStrictEqual([["item2", "2"]]);
  });
  test("newKeys", () => {
    const delta = new PersistentCacheUpdateDelta<string>();
    delta.addNewKeyDelta("item0");
    delta.addNewKeyDelta("item1");
    delta.addNewKeyDelta("item2");

    const newKeys = Array.from(
      delta.getNewKeys((k) => k === "item0" ? k : undefined),
    );
    expect(newKeys).toStrictEqual(["item0"]);
  });
  test("removeKeys", () => {
    const delta = new PersistentCacheUpdateDelta<string>();
    delta.addRemoveKeyDelta("item0");
    delta.addRemoveKeyDelta("item1");
    delta.addRemoveKeyDelta("item2");

    const removeKeys = Array.from(
      delta.getRemoveKeys((k) => k === "item0" ? k : undefined),
    );
    expect(removeKeys).toStrictEqual(["item0"]);
  });
});

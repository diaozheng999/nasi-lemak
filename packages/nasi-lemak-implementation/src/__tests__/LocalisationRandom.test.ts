/**
 * LocalisationRandom.test.ts
 * @author Diao Zheng
 * @file test cases for getRandomString function in Localisation
 */

import {
  getRandomString,
  updateResource,
} from "../DONOTUSEInternalLocalisation";

updateResource("en-US", {
  key: "value",
  nested: {
    key: "nested value",
    key2: "fallback",
  },
  random: [
    "string0",
    "string1",
  ],
  replacement: {
    escape: "$$",
    escape1: "$$$0",
    escape2: " $$ $0",
    escape3: "$0$$",
    head: "$0.",
    reverse: "$1 $0",
    simple: "Hello $0.",
    skip: "hello $1",
    solo: "$0",
    unreplaced: "$$0",
  },
});

jest.mock("../../Localisation/zh.json", () => ({
  key: "value2",
  nested : {
    key : "nested value2",
  },
}), {virtual: true});

test("getRandomString lowerbound", () => {
  Math.random = () => 0;
  expect(getRandomString("random")).toBe("string0");
});

test("getRandomString value", () => {
  Math.random = () => 0.5 - Number.EPSILON;
  expect(getRandomString("random")).toBe("string0");
});

test("getRandomString value2", () => {
  Math.random = () => 0.5;
  expect(getRandomString("random")).toBe("string1");
});

test("getRandomString upperbound", () => {
  Math.random = () => 1 - Number.EPSILON;
  expect(getRandomString("random")).toBe("string1");
});

test("getRandomString passthrough", () => {
  expect(getRandomString("key")).toBe("value");
});

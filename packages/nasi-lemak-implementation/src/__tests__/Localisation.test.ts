/**
 * Localisation.test.ts
 * @author Diao Zheng
 * @file Tests for Core/Localisation.ts
 */

import {
  convertDate,
  l,
  setLanguage,
  updateResource,
} from "../DONOTUSEInternalLocalisation";
import * as Localisation from "../Localisation";

updateResource("en-US", {
  format: {
    date: {
      long: "DD MMM YYYY",
      short: "DD MMM",
    },
  },
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

updateResource("zh", {
  format: {
    date: {
      long: "YYYY年MM月DD日",
      short: "MM月DD日",
    },
  },
  key: "value2",
  nested: {
    key: "nested value2",
  },
});

beforeAll(() => {
  Localisation.addLanguage("boo", undefined, "en-US" as any);
});

test("l get value en-US", () => {
  setLanguage("en-US");
  expect(l("key")).toBe("value");
});

test("l get value zh", () => {
  setLanguage("zh");
  expect(l("key")).toBe("value2");
});

test("l get value scoped", () => {
  setLanguage("en-US");
  expect(l("nested.key")).toBe("nested value");
});

test("l fallback", () => {
  setLanguage("en-US");
  expect(l("nested.key2")).toBe("fallback");
  setLanguage("zh");
  expect(l("nested.key2")).toBe("fallback");
});

test("l undefined", () => {
  setLanguage("en-US");
  expect(l("unknown")).toBe("unknown");
});

test("l replace", () => {
  setLanguage("en-US");
  expect(l("replacement.simple")).toBe("Hello $0.");
  expect(l("replacement.simple", "key")).toBe("Hello value.");
});

test("l solo", () => {
  setLanguage("en-US");
  expect(l("replacement.solo", "key")).toBe("value");
});

test("l head", () => {
  setLanguage("en-US");
  expect(l("replacement.head", "key")).toBe("value.");
});

test("l unreplaced", () => {
  setLanguage("en-US");
  expect(l("replacement.unreplaced", "key")).toBe("$0");
});

test("l skip", () => {
  setLanguage("en-US");
  expect(l("replacement.skip", "blah", "key")).toBe("hello value");
});

test("l escape", () => {
  setLanguage("en-US");
  expect(l("replacement.escape", "key")).toBe("$");
});

test("l escape1", () => {
  setLanguage("en-US");
  expect(l("replacement.escape1", "20")).toBe("$20");
});

test("l escape2", () => {
  setLanguage("en-US");
  expect(l("replacement.escape2", "20")).toBe(" $ 20");
});

test("l escape3", () => {
  setLanguage("en-US");
  expect(l("replacement.escape3", "key")).toBe("value$");
});

test("l reverse", () => {
  setLanguage("en-US");
  expect(l("replacement.reverse", "key", "nested.key2")).toBe("fallback value");
});

test("l locale", () => {
  setLanguage("zh");
  expect(l("replacement.simple", "key")).toBe("Hello value2.");
});

test("l nested replacements", () => {
  setLanguage("en-US");
  expect(l(
    "replacement.reverse",
    ["replacement.simple", ["key"]], // Hello value.
    ["replacement.reverse",
      ["nested.key2", "key"],
    ], // value fallback
  )).toBe("value fallback Hello value.");
});

test("l nested don't eval", () => {
  setLanguage("en-US");
  expect(l(
    "replacement.simple",
    ["replacement.unreplaced", []],
  )).toBe("Hello $$0.");
});

test("l non-existent", () => {
  expect(l("non-existent")).toBe("non-existent");
});

test("l non-existent replacement", () => {
  expect(l("non-existent $0 $1", "r1", "r2")).toBe("non-existent r1 r2");
});

test("l non-existent replacement 2", () => {
  expect(l("non-existent $0", "r1")).toBe("non-existent r1");
});

test("l non-existent replacement invalid", () => {
  expect(l("non-existent $232223", "r1")).toBe("{non-existent $232223: r1}");
});

test("l array passthrough", () => {
  expect(l("random")).toBe("string0");
});

test("l invalid language", () => {
  setLanguage("boo" as any);
  expect(l("key")).toBe("value");
});

test("convertDate en-Us", () => {
  setLanguage("en-US");
  expect(convertDate(new Date(1436544000000))).
    toBe("11 Jul 2015"); // Date is 11 Jul 2015, number is in milliseconds
});

test("convertDate zh", () => {
  setLanguage("zh");
  expect(convertDate(new Date(1436544000000))).
    toBe("2015年07月11日"); // Date is 11 Jul 2015, number is in milliseconds
});

test("convertDate en-Us with full digit date", () => {
  setLanguage("en-US");
  expect(convertDate(new Date(1535904000000))).
    toBe("03 Sep 2018"); // Date is 03 Sep 2018, number is in milliseconds
});

test("convertDate zh with full digit date", () => {
  setLanguage("zh");
  expect(convertDate(new Date(1535904000000))).
    toBe("2018年09月03日"); // Date is 03 Sep 2018, number is in milliseconds
});

test("convertDate random language set", () => {
  setLanguage("boo" as any);
  expect(convertDate(new Date(1436544000000))).
    toBe("Invalid Date"); // Date is 11 Jul 2015, number is in milliseconds
});

test("convertDate en-Us with short digit date", () => {
  setLanguage("en-US");
  expect(convertDate(new Date(2015, 6, 11), "format.date.short")).
    toBe("11 Jul"); // Date is 11 Jul 2015
});

test("convertDate zh with short digit date", () => {
  setLanguage("zh");
  expect(convertDate(new Date(2015, 6, 11), "format.date.short")).
    toBe("07月11日"); // Date is 11 Jul 2015
});

test("convertDate en-Us with short digit date", () => {
  setLanguage("en-US");
  expect(convertDate(new Date(2018, 8, 3), "format.date.short")).
    toBe("03 Sep"); // Date is 03 Sep 2018
});

test("convertDate zh with short digit date", () => {
  setLanguage("zh");
  expect(convertDate(new Date(2018, 8, 3), "format.date.short")).
    toBe("09月03日"); // Date is 03 Sep 2018
});

test("convertDate random language set with short digit date", () => {
  setLanguage("boo" as any);
  expect(convertDate(new Date(2015, 6, 11), "format.date.short")).
    toBe("Invalid Date"); // Date is 11 Jul 2015
});

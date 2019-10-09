/**
 * Localisation.test.tsx
 * @author Diao Zheng
 * @file test cases for the useLocalisation hook
 */

import React from "react";
import renderer from "react-test-renderer";
import {
  Context,
  registeredLanguage,
  updateResource,
} from "../DONOTUSEInternalLocalisation";
import { ConvertDateType, useLocalisation } from "../Localisation";

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

function TestString(props: {
  lkey: string;
  replacements?: Array<string | [string, string[]]>;
}) {
  const [ l ] = useLocalisation();
  return React.createElement("TestOutput", {
    response: (
      props.replacements ?
        l(props.lkey, ...props.replacements)
      :
        l(props.lkey)
    ),
  });
}

function TestDate(props: {
  date: Date;
  format?: ConvertDateType;
}) {
  const convertDate = useLocalisation()[1];
  return React.createElement("TestOutput", {
    response: convertDate(props.date, props.format),
  });
}

test("basic translations", () => {
  const tree = renderer.create(
    <Context.Provider value={registeredLanguage("en-US")}>
      <TestString lkey="key" />
    </Context.Provider>,
  );

  const result = tree.root.findByType("TestOutput" as any);
  expect(result.props.response).toBe("value");

  tree.update(
    <Context.Provider value={registeredLanguage("zh")}>
      <TestString lkey="key" />
    </Context.Provider>,
  );

  expect(result.props.response).toBe("value2");
});

test("fallback", () => {
  const tree = renderer.create(
    <Context.Provider value={registeredLanguage("en-US")}>
      <TestString lkey="nested.key2" />
    </Context.Provider>,
  );

  const result = tree.root.findByType("TestOutput" as any);
  expect(result.props.response).toBe("fallback");

  tree.update(
    <Context.Provider value={registeredLanguage("zh")}>
      <TestString lkey="nested.key2" />
    </Context.Provider>,
  );

  expect(result.props.response).toBe("fallback");
});

test("nested replacements", () => {
  const replacements: Array<string | [string, string[]]> = [
    ["replacement.simple", ["key"]], // Hello value.
    ["replacement.reverse",
      ["nested.key2", "key"],
    ], // value fallback
  ];

  const tree = renderer.create(
    <Context.Provider value={registeredLanguage("en-US")}>
      <TestString
        lkey="replacement.reverse"
        replacements={replacements}
      />
    </Context.Provider>,
  );

  const result = tree.root.findByType("TestOutput" as any);
  expect(result.props.response).toBe("value fallback Hello value.");
});

test("date without format", () => {
  const tree = renderer.create(
    <Context.Provider value={registeredLanguage("en-US")}>
      <TestDate date={new Date(2019, 2 - 1, 3)} />
    </Context.Provider>,
  );

  const result = tree.root.findByType("TestOutput" as any);
  expect(result.props.response).toBe("03 Feb 2019");

  tree.update(
    <Context.Provider value={registeredLanguage("zh")}>
      <TestDate date={new Date(2019, 2 - 1, 3)} />
    </Context.Provider>,
  );

  expect(result.props.response).toBe("2019年02月03日");
});

test("date with format", () => {
  const tree = renderer.create(
    <Context.Provider value={registeredLanguage("en-US")}>
      <TestDate date={new Date(2019, 2 - 1, 3)} format="format.date.short" />
    </Context.Provider>,
  );

  const result = tree.root.findByType("TestOutput" as any);
  expect(result.props.response).toBe("03 Feb");

  tree.update(
    <Context.Provider value={registeredLanguage("zh")}>
      <TestDate date={new Date(2019, 2 - 1, 3)} format="format.date.short" />
    </Context.Provider>,
  );

  expect(result.props.response).toBe("02月03日");
});

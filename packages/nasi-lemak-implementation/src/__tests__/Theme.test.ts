/**
 * Theme.test.ts
 * @author Diao Zheng
 * @file test cases for theme engine
 */

import {
  DONOTUSEInternalTheme as Theme,
  StyleSheet,
} from "..";

beforeEach(() => {
  Theme.setTheme("DEFAULT");
  Theme.UNSAFE_resetHandlers();
  Theme.UNSAFE_clearRegisteredTemplateKeys();
});

/**
 * Ensure that if a key is set, We can retrieve the theme from the same key
 */
test("theme register", () => {
  const style = StyleSheet.composable({
    a: {padding: 2},
  });
  Theme.register("DEFAULT", "hello", style);

  expect(Theme.getStyle("hello").value).toStrictEqual(style.value);
});

/**
 * We ensure that the appropriate style is returned if we switch
 * themes.
 */
test("theme register proper key", () => {
  const style1 = StyleSheet.composable({
    a: {padding: 2},
  });
  const style2 = StyleSheet.composable({
    b: {padding: 2},
  });
  Theme.register("DEFAULT", "hello", style1);
  Theme.register("ELECTABUZZ", "hello", style2);
  expect(Theme.getStyle("hello").value).toStrictEqual(style1.value);
  Theme.setTheme("ELECTABUZZ");
  expect(Theme.getStyle("hello").value).toStrictEqual(style2.value);
  Theme.setTheme("DEFAULT");
  expect(Theme.getStyle("hello").value).toStrictEqual(style1.value);
});

/**
 * We ensure that if a registered handler is called if and only if a change in
 * theme happens.
 */
test("theme setTheme handler", () => {
  const handler = jest.fn();
  Theme.setHandler(handler);
  Theme.setTheme("DEFAULT");
  expect(handler).not.toBeCalled();
  Theme.setTheme("ELECTABUZZ");
  expect(handler).toBeCalled();
});

/**
 * We ensure that if a handler is deregistered it is not being called.
 */
test("theme setTheme handler when removed", () => {
  Theme.setTheme("DEFAULT");
  const handler1 = jest.fn();
  const handlerId = Theme.setHandler(handler1);
  Theme.setTheme("DEFAULT");
  expect(handler1).not.toBeCalled();
  Theme.removeHandler(handlerId);
  Theme.setTheme("ELECTABUZZ");
  expect(handler1).not.toBeCalled();
});

/**
 * We expect a fallback style to be returned if the current theme style is
 * not defined.
 */
test("theme getStyle fallback", () => {
  const fallback = StyleSheet.composable({
    a: {padding: 123123},
  });

  Theme.register("DEFAULT", "fallback", fallback);
  Theme.setTheme("ELECTABUZZ");
  expect(Theme.getStyle("fallback").value).toStrictEqual(fallback.value);
});

/**
 * We expect a hard error if getStyle encounters something that does not exist
 */
test("theme getStyle error", () => {
  const fallback = StyleSheet.composable({
    a: {padding: 123123},
  });

  Theme.register("DEFAULT", "fallback", fallback);
  Theme.setTheme("MEWTWO" as any);
  expect(() => Theme.getStyle("fallback")).toThrowError();
});

/**
 * We expect getCurrentTheme to return the expected value.
 */
test("theme getCurrentTheme", () => {
  expect(Theme.getCurrentTheme()).toBe("DEFAULT");
  Theme.setTheme("ELECTABUZZ");
  expect(Theme.getCurrentTheme()).toBe("ELECTABUZZ");
  Theme.setTheme("DEFAULT");
  expect(Theme.getCurrentTheme()).toBe("DEFAULT");
});

/**
 * We expect that the handler registry data structure works as intended: i.e.
 *   - running keys will be set
 *   - when a key of a handler is deleted, that handler will be removed from
 *     the data structure.
 */
test("theme setTheme handler data structure", () => {
  const handler1 = jest.fn();
  const handler2 = jest.fn();
  const handler3 = jest.fn();
  const id1 = Theme.setHandler(handler1);
  Theme.setHandler(handler2);
  Theme.removeHandler(id1);
  Theme.setHandler(handler3);
  Theme.setTheme("ELECTABUZZ");
  expect(handler1).not.toBeCalled();
  expect(handler2).toBeCalled();
  expect(handler3).toBeCalled();
});

/**
 * we expect that createTemplate to create a template with the expected
 * default values.
 */
test("theme createTemplate", () => {
  const p = Theme.createTemplate("hello", {
    a: {
      padding: 10,
    },
  });
  expect(p.key).toBe("hello");
  expect(p.default.value).toStrictEqual({
    a: {
      padding: 10,
    },
  });
});

/**
 * We expect that registering two templates to the same key in dev mode is not
 * allowed.
 */
test("theme createTemplate duplicate in dev mode", () => {
  Theme.createTemplate("hello", {});
  expect(() => Theme.createTemplate("hello", {})).toThrowError();
});

/**
 * We expect that when we call register, we'll actually get the registered
 * style from Theme.
 */
test("theme createTemplate register", () => {
  const style = {
    a: {padding: 10},
  };
  const template = Theme.createTemplate("hello", style);
  template.register("DEFAULT");
  expect(Theme.getStyle(template.key).value).toStrictEqual(style);
  expect(template.getStyle().value).toStrictEqual(style);
});

/**
 * We expect that when we call register, we'll actually get the registered
 * style from Theme.
 */
test("theme createTemplate register new style", () => {
  const style = {
    a: { padding: 10 },
  };

  const style1 = {
    a: { padding: 11 },
  };

  const template = Theme.createTemplate("hello", style);
  template.register("DEFAULT", { ...style1 });
  expect(Theme.getStyle(template.key).value).toStrictEqual(style1);
  expect(template.getStyle().value).toStrictEqual(style1);
});

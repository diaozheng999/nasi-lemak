
/**
 * StyleSheet.test.ts
 * @author Diao Zheng
 * @file Test cases for style sheet composition
 */

import _ from "lodash";
import * as SS from "../StyleSheet";

test("compose empty", () => {
  expect(SS.compose({}, {})).toStrictEqual({});
});

test("compose passthrough", () => {
  const base = {
    a: {
      width: 1,
    },
  };
  expect(SS.compose({}, base)).toStrictEqual(base);
  expect(SS.compose({}, base)).not.toBe(base);

  expect(SS.compose({}, base, true)).toStrictEqual(base);
  expect(SS.compose({}, base, true)).not.toBe(base);

  expect(SS.compose({}, base, false)).toStrictEqual(base);
  expect(SS.compose({}, base, false)).not.toBe(base);
});

test("compose override=false", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };

  const style = {
    a: { width: 3 },
  };

  const composed = SS.compose(style, base);

  expect(composed).toStrictEqual({
    a: [{width: 1}, {width: 3}],
    b: {width: 2},
  });

  expect(composed).toBe(style);
});

test("compose override=true", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };

  const style = {
    a: { width: 3 },
  };

  const composed = SS.compose(style, base, true);

  expect(composed).toStrictEqual({
    a: {width: 3},
    b: {width: 2},
  });

  expect(composed).toBe(style);
});

test("compose self", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };

  const composed = SS.compose(base, base);

  expect(composed).toStrictEqual({
    a: {width: 1},
    b: {width: 2},
  });

  expect(composed).toBe(base);
});

test("composable semantics", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };

  const composable = SS.composable(base);

  expect(composable.value).toBe(base);
});

test("composable weirdness", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };

  const composable = SS.composable(base);

  expect(composable.compose(base).value).toBe(base);
});

test("composable chain override=false", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };
  const style = {
    a: { width: 3 },
  };

  const composable = SS.composable(base).compose(style);

  expect(composable.value).toEqual({
    a: [{width: 1}, {width: 3}],
    b: {width: 2},
  });

  expect(composable.value).toBe(style);
});

test("composable chain override=true", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };
  const style = {
    a: { width: 3 },
  };

  const composable = SS.composable(base).compose(style, true);

  expect(composable.value).toEqual({
    a: {width: 3},
    b: {width: 2},
  });

  expect(composable.value).toBe(style);
});

test("composable chain other base", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };
  const style = {
    a: { width: 3 },
  };

  const composable = SS.composable({}).compose(style, false, base);

  expect(composable.value).toEqual({
    a: [{width: 1}, {width: 3}],
    b: {width: 2},
  });

  expect(composable.value).toBe(style);
});

test("composable weirdness 2", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };
  const style = {
    a: { width: 3 },
  };

  const composed = SS.composable(base).compose(style).compose(base, true);

  expect(composed.value).toStrictEqual(base);
  expect(composed.value).toBe(base);

  expect(style).toStrictEqual({
    a: [{width: 1}, {width: 3}],
    b: {width: 2},
  });
});

test("composable flatten", () => {
  const base = {
    a: { width: 1 },
    b: { width: 2 },
  };
  const style = {
    a: { width: 3 },
  };

  const composed = SS.composable(base).compose(style);

  const flattened = composed.flatten();

  expect(flattened).not.toBe(composed);

  expect(_.isArray(flattened.value.a)).toBe(false);
  expect(_.isArray(flattened.value.b)).toBe(false);
});

test("flatten falsy", () => {
  const style = {
    a: false as false,
    b: undefined,
    c: null,
  };

  expect(SS.flatten(style)).toStrictEqual({
    a: null,
    b: null,
    c: null,
  });
});

test("flatten registered style", () => {
  const styles = {
    a: {
      padding: 5,
    },
  };
  expect(SS.flatten(styles)).toStrictEqual({
    a: styles.a,
  });
});

test("flatten composition", () => {
  const styles = {
    a: {
      padding: 5,
    },
    b: {
      padding: 6,
    },
  };

  const composed = SS.compose({b: {padding: 7}}, styles);

  const flattened = SS.flatten(composed);

  expect(_.isArray(flattened.b)).toBe(false);
  expect(flattened.a).toBe(styles.a);
  expect(SS.flatten(flattened.b)).toStrictEqual({
    padding: 7,
  });
});

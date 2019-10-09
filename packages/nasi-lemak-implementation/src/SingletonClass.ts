/**
 * SingletonClass.ts
 * @author Diao Zheng
 * @file React hook to export a single object.
 * @barrel hook
 */

import { useEffect, useReducer } from "react";

export function useSingletonClass<T, TConstructorArgs extends any[]>(
  constructor: new (...args: TConstructorArgs) => T,
  ...args: TConstructorArgs
) {
  const [ singleton, dispatch ] = useReducer<
    (state: [T, TConstructorArgs], action: TConstructorArgs) =>
      [T, TConstructorArgs],
    TConstructorArgs
  >(
    (s, newArgs) => {
      const len = newArgs.length;
      for (let i = 0; i < len; ++i) {
        if (newArgs[i] !== s[1][i]) {
          return [new constructor(...newArgs), newArgs];
        }
      }
      return s;
    },
    args,
    (constructorArgs) => {
      return [new constructor(...constructorArgs), constructorArgs];
    },
  );

  useEffect(() => dispatch(args), args);
  return singleton[0];
}

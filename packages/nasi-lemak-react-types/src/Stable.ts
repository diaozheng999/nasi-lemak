/**
 * Stable.ts
 * @author Diao Zheng
 * @file Stable functions
 */

// @barrel export all

import { Option, Types } from "nasi";

/**
 * A not exported symbol to declare this function as "Stable".
 * This is intentionally not exported.
 */
const STABLE = Symbol();

type StableFunction<TArgs extends unknown[], TReturn> = Types.Opaque<
  (...args: TArgs) => TReturn,
  typeof STABLE
>;

export type Function<TArgs extends unknown[], TReturn> =
  StableFunction<TArgs, TReturn>;

export type Dispatch<TAction> = StableFunction<[TAction], void>;

type StableDispatch<TAction> = Dispatch<TAction>;

export function declareAsStable<TArgs extends unknown[], TReturn>(
  f: (...args: TArgs) => TReturn,
): Function<TArgs, TReturn> {
  return f as any;
}

declare module "react" {
  function useMemo<TArgs extends unknown[], TReturn>(
    factory: () => (...args: TArgs) => TReturn,
    deps: readonly unknown[],
  ): StableFunction<TArgs, TReturn>;
  function useCallback<TArgs extends unknown[], TReturn>(
    callback: (...args: TArgs) => TReturn,
    deps: readonly unknown[],
  ): StableFunction<TArgs, TReturn>;
  function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & React.ReducerState<R>,
    initializer: (arg: I & React.ReducerState<R>) => React.ReducerState<R>,
  ): [
    React.ReducerState<R>,
    StableDispatch<React.ReducerAction<R>>
  ];
  function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => React.ReducerState<R>,
  ): [
    React.ReducerState<R>,
    StableDispatch<React.ReducerAction<R>>
  ];
  function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer?: undefined,
  ): [
    React.ReducerState<R>,
    StableDispatch<React.ReducerAction<R>>
  ];
  function useState<S>(initialState: S | (() => S)): [
    S,
    StableDispatch<React.SetStateAction<S>>,
  ];
  function useState<S = undefined>(): [
    Option.Type<S>,
    StableDispatch<React.SetStateAction<Option.Type<S>>>,
  ];
}

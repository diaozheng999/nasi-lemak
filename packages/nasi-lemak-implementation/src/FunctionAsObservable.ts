/**
 * FunctionAsObservable.ts
 * Copyright 2019 M1 Limited
 * @file A hook to use a function as an Observable while preserving references
 */

// @barrel hook

import { useCallback } from "react";
import { useAsObservable } from "./AsObservable";

/**
 * Creates a stable function from the existing function and use that as an
 * Observable.
 *
 * This internally uses `useCallback` in React to stabilise the functions.
 *
 * @param lambda the function to stabilise
 * @param deps list of dependencies to update the function
 * @returns an observable of the stabilised functions
 */
export function useFunctionAsObservable<T extends (...args: any[]) => any>(
  lambda: T,
  deps: readonly unknown[],
) {
  const memoised = useCallback(lambda, deps);
  return useAsObservable(memoised);
}

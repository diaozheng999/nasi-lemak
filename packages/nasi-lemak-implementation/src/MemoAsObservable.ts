/**
 * MemoAsObservable.ts
 * Copyright 2019 M1 Limited
 * @file hook to use a memoised value as Observable
 */

// @barrel hook

import { useMemo } from "react";
import { useAsObservable } from "./AsObservable";

/**
 * Creates a memoised version of an object and use that as an Observable.
 *
 * This internally uses `useMemo` in React for memoisation.
 *
 * @param f the factory function
 * @param deps list of dependencies to update the memoised value
 * @returns an observable of the stabilised functions
 */
export function useMemoAsObservable<T>(f: () => T, deps: readonly unknown[]) {
  const value = useMemo(f, deps);
  return useAsObservable(value);
}

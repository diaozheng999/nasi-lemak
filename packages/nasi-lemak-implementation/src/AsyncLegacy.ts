/**
 * AsyncLegacy.ts
 * @author Diao Zheng
 * @file Older implementation of useAsync hook without interrupt.
 * @barrel hook
 */

import { Option } from "nasi";
import { useEffect, useMemo } from "react";
import { useAsync } from "./Async";

export function useAsyncLegacy<TArgs extends any[], TResolution>(
  promise: (...args: TArgs) => Promise<TResolution>,
  dispatch: TArgs,
  additionalDependencies?: any[],
): Option.Type<TResolution> {

  const memoised = useMemo(() => promise, additionalDependencies ?? []);

  const [ resolution, execute ] = useAsync(
    memoised,
    {},
    additionalDependencies,
  );

  useEffect(
    () => execute(...dispatch),
    [
      ...dispatch,
      ...(additionalDependencies ?? []),
    ],
  );

  return resolution;
}

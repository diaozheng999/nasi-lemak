/**
 * AsyncLegacy.ts
 * @author Diao Zheng
 * @file Older implementation of useAsync hook without interrupt.
 * @barrel hook
 */

import { Option } from "nasi";
import { useEffect } from "react";
import { useAsync } from "./Async";

export function useAsyncLegacy<TArgs extends any[], TResolution>(
  promise: (...args: TArgs) => Promise<TResolution>,
  dispatch: TArgs,
  additionalDependencies?: any[],
): Option.Type<TResolution> {
  const [ resolution, execute ] = useAsync(promise, {}, additionalDependencies);

  useEffect(
    () => execute(...dispatch),
    [
      ...dispatch,
      promise,
      ...Option.value(additionalDependencies, []),
    ],
  );

  return resolution;
}

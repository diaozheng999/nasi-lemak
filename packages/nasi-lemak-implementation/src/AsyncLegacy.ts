/**
 * AsyncLegacy.ts
 * @author Diao Zheng
 * @file Older implementation of useAsync hook without interrupt.
 * @barrel hook
 */

import { Option } from "nasi";
import { Stable } from "nasi-lemak-react-types";
import { useEffect } from "react";
import { useAsync } from "./Async";

export function useAsyncLegacy<TArgs extends any[], TResolution>(
  promise: (...args: TArgs) => Promise<TResolution>,
  dispatch: TArgs,
  additionalDependencies?: any[],
): Option.Type<TResolution> {
  const [ resolution, execute ] = useAsync(
    Stable.declareAsStable(promise),
    {},
    additionalDependencies,
  );

  useEffect(
    () => execute(...dispatch),
    [
      ...dispatch,
      promise,
      ...(additionalDependencies ?? []),
    ],
  );

  return resolution;
}

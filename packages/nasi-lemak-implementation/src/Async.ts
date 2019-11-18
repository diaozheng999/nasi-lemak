/**
 * Async.ts
 * @author Diao Zheng
 * @file React hook to use asynchronous side effect
 * @barrel hook
 */

import _ from "lodash";
import { Mutex, Option } from "nasi";
import { Stable } from "nasi-lemak-react-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSingletonClass } from "./SingletonClass";

export interface IUseAsyncOptions {
  synchronous?: boolean;
  rejectAfter?: number;
}

/**
 * @param promise
 * @param additionalDependencies
 */
export function useAsync<
  TArgs extends unknown[],
  TResolution,
>(
  promise: Stable.Function<TArgs, Promise<TResolution>>,
  options?: IUseAsyncOptions,
  additionalDependencies?: readonly unknown[],
): [
  Option.Type<TResolution>,
  Stable.Function<TArgs, void>
] {
  const interrupt = useRef(false);
  const synchronous = options?.synchronous === true;
  const mutex = useSingletonClass(Mutex);

  const [ resolution, setResolution ] = useState<Option.Type<TResolution>>(
    undefined,
  );

  const internalDependencyList = [
    promise,
    synchronous,
  ];

  const dependencyList = (
    additionalDependencies ?
      _.concat(internalDependencyList, additionalDependencies)
    :
      internalDependencyList
  );

  const execute = useCallback(
    (...args: TArgs) => {

      const res = (
        synchronous ?
          mutex.lock(
            () => promise(...args),
            options?.rejectAfter,
          )
        :
          (() => promise(...args))()
      );

      res.then((result) => {
        if (!interrupt.current) {
          setResolution(result);
        }
      });
    },
    dependencyList,
  );

  useEffect(() => () => {
    interrupt.current = true;
  }, []);

  return [
    resolution,
    execute,
  ];
}

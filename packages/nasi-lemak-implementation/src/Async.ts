/**
 * Async.ts
 * @author Diao Zheng
 * @file React hook to use asynchronous side effect
 * @barrel hook
 */

import _ from "lodash";
import { Mutex, Option } from "nasi";
import { useEffect, useMemo, useRef, useState } from "react";
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
  promise: (...args: TArgs) => Promise<TResolution>,
  options?: IUseAsyncOptions,
  additionalDependencies?: readonly unknown[],
): [
  Option.Type<TResolution>,
  (...args: TArgs) => void,
] {
  const interrupt = useRef(false);
  const synchronous = Option.property(options, "synchronous") === true;
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

  const execute = useMemo(
    () => (...args: TArgs) => {

      const res = (
        synchronous ?
          mutex.lock(
            () => promise(...args),
            Option.property(options, "rejectAfter"),
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

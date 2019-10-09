/**
 * ICacheDriver.ts
 * @author Diao Zheng
 * @file defines a cache driver interface.
 * @ignore_test
 */

import { Option } from "nasi";
import { OperatorFunction } from "rxjs";

export interface ICacheDriver<T, K> {
  set: OperatorFunction<[ K, T ], T>;
  get: OperatorFunction<K, Option.Type<T>>;
  updateHeuristic?: (latestDuration: number) => void;
}

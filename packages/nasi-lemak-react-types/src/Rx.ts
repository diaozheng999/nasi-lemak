/**
 * Rx.ts
 * @author Diao Zheng
 * @file RxJS utility functions
 */

// @barrel export all

import { Types } from "nasi";
import {
  Observable,
  ObservableInput,
  partition as rxpartition,
} from "rxjs";

/**
 * A special case of `partition` in RxJS where the predicate is actually a
 * type guard.
 */
export function partition<U, T extends U>(
  source: ObservableInput<U>,
  predicate: (value: U) => value is T,
): [ Observable<T>, Observable<Types.Not<U, T>> ] {
  return rxpartition<any>(source, predicate);
}

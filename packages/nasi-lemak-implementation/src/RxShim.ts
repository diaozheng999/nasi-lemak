/**
 * RxShim.ts
 * @author Diao Zheng
 * @file hacky stuff relating to RxJS-to-hook conversions.
 */

import { Subject } from "rxjs";

// @barrel ignore

/**
 * We're hacking the `useReducer` reducer to give us a stable function that
 * allows us to update said item.
 * @param subject$ The "state", or rather, the subject to emit values to
 * @param value The "action", or rather, the next value to emit
 * @returns always the object `subject$`
 */
export function rxUpdateReducer<T>(subject$: Subject<T>, value: T): Subject<T> {
  subject$.next(value);
  return subject$;
}

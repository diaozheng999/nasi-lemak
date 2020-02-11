/**
 * Rx.ts
 * @author Diao Zheng
 * @file RxJS utility functions
 */

// @barrel export all

import { assert, Option, Types } from "nasi";
import {
  Observable,
  ObservableInput,
  OperatorFunction,
  partition as rxpartition,
  Subject,
} from "rxjs";
import { declareAsStable, Dispatch as StableDispatch } from "./Stable";

export interface IObservableDispatch<TAction> {
  dispatch: StableDispatch<TAction>;
  close: () => void;
}

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

export function asDispatch<InputAction, OutputAction>(
  output: StableDispatch<OutputAction>,
  operator: OperatorFunction<InputAction, OutputAction>,
): IObservableDispatch<InputAction> {

  const input$ = new Subject<InputAction>();

  input$.pipe(operator).subscribe({
    next: output,
  });

  return {
    close: () => input$.complete(),
    dispatch: declareAsStable((action) => {
      assert(Option.isSome, action);
      input$.next(action);
    }),
  };

}

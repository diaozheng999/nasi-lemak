/**
 * AsObservable.ts
 * Copyright 2019 M1 Limited
 * @file hook to use a React State as Observable
 */

// @barrel hook

// We know what we're doing
/* eslint-disable react-hooks/exhaustive-deps */

import { Stable } from "nasi-lemak-react-types";
import { useEffect, useReducer } from "react";
import { BehaviorSubject, Observable, Subject } from "rxjs";

/**
 * We're hacking the `useReducer` reducer to give us a stable function that
 * allows us to update said item.
 * @param subject$ The "state", or rather, the subject to emit values to
 * @param value The "action", or rather, the next value to emit
 * @returns always the object `subject$`
 */
function updateValue<T>(subject$: Subject<T>, value: T): Subject<T> {
  subject$.next(value);
  return subject$;
}

export function useAsObservable<T extends unknown[], U>(
  value: Stable.Function<T, U>,
): Observable<(...args: T) => U>;
export function useAsObservable<T extends (...args: any) => any>(
  value: T,
): Observable<never>;
export function useAsObservable<T>(
  value: T,
): Observable<T>;
/**
 * Uses a state value as an rxjs Observable.
 *
 * Internally, this hook uses React's reference equality to check to determine
 * whether or not a new value should be emitted. (which, as of 16.9, is using
 * `===` equality check).
 *
 * There may be infinite render loops when using static objects as observables
 * in hook like this:
 * ```
 * // DON'T DO THIS
 * const observable$ = useAsObservable([ item1, item2 ]);
 * ```
 * this is because every invocation of a hook will generate a new object, which
 * signals to the hook that it's a different object and should therefore be
 * emitted to RxJS.
 *
 * To prevent this from happening, wrap whatever you want in a `useMemo` or
 * `useCallback` hook before passing in to this hook.
 *
 * @param value
 */
export function useAsObservable<T>(value: T): Observable<T> {
  const [ subject$, dispatch ] = useReducer<React.Reducer<Subject<T>, T>, null>(
    updateValue,
    null,
    () => new BehaviorSubject<T>(value),
  );
  useEffect(() => () => subject$.complete(), []);
  useEffect(() => {
    dispatch(value);
  }, [ value ]);
  return subject$;
}

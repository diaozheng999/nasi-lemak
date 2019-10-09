/**
 * StateReducer.ts
 * @author Diao Zheng
 * @file A reducer that simply returns the state
 * @barrel export StateReducerType
 */

export type StateReducerType<S> = (p1: S, p2: S) => S;

export function StateReducer<S>(_: S, s: S) {
  return s;
}

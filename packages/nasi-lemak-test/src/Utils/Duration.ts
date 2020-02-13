
/**
 * Duration.ts
 * @author Diao Zheng
 * @file Utilities functions that represent a non-instant period of time
 */

// @barrel export all

export const FRAME = Symbol("SideEffectExecutor/FRAME");
export const IMMEDIATE = Symbol("SideEffectExecutor/IMMEDIATE");
export const INSTANT = Symbol("SideEffectExecutor/INSTANT");
export const NEXT_FRAME = Symbol("SideEffectExecutor/NEXT_FRAME");

export interface IRationalisedDuration {
  readonly [IMMEDIATE]: boolean;
  readonly timer: number;
}

type TimerDuration =
  | number
  | typeof FRAME
  | typeof NEXT_FRAME
  | typeof INSTANT
;

type Duration =
  | TimerDuration
  | typeof IMMEDIATE
  | { readonly [IMMEDIATE]: boolean, readonly timer: TimerDuration }
;

type Finite<T extends Duration> =
  T extends typeof FRAME ?
    never
  : T extends typeof NEXT_FRAME ?
    never
  : T extends typeof INSTANT ?
    never
  : T extends typeof IMMEDIATE ?
    never
  :
    T
;

export type Type = Duration;

export const TARGET_FRAMES_PER_SECOND = 60;

let frameDuration = 1000 / TARGET_FRAMES_PER_SECOND;

function standardise(duration: Duration): Duration {
  if (typeof duration === "object" && !duration[IMMEDIATE]) {
    return duration.timer;
  }
  return duration;
}

function mergeFinite(
  left: Finite<Duration>,
  right: Finite<Duration>,
): Finite<Duration> {

  switch (typeof left) {

    case "number":
      switch (typeof right) {
        case "number":
          return left + right;

        case "object":
          return {...right, timer: reducer(right.timer, left) };
      }

    case "object":
      switch (typeof right) {
        case "number":
          return {...left, timer: reducer(left.timer, right) };

        case "object":
          return {
            [IMMEDIATE]: left[IMMEDIATE] || right[IMMEDIATE],
            timer: reducer(left.timer, right.timer),
          };
      }

  }

}

export function setFpsTarget(target: number = TARGET_FRAMES_PER_SECOND) {
  frameDuration = 1000 / target;
}

export function rationalise(duration: Duration): IRationalisedDuration {
  switch (typeof duration) {
    case "number":
      return { [IMMEDIATE]: false, timer: duration };
    case "object":
      if (typeof duration.timer === "symbol") {
        const { timer } = rationalise(duration.timer);
        return { [IMMEDIATE]: duration[IMMEDIATE], timer };
      } else {
        return {
          [IMMEDIATE]: duration[IMMEDIATE],
          timer: duration.timer,
        };
      }
  }
  switch (duration) {
    case FRAME:
    case NEXT_FRAME:
      return { [IMMEDIATE]: false, timer: frameDuration };

    case INSTANT:
      return { [IMMEDIATE]: false, timer: 0 };

    case IMMEDIATE:
      return { [IMMEDIATE]: true, timer: frameDuration };
  }
}
export function reducer(
  left: TimerDuration,
  right: TimerDuration,
): TimerDuration;
export function reducer(
  left: Duration,
  right: Duration,
): Duration;
export function reducer(left: Duration, right: Duration): Duration {
  switch (left) {
    case INSTANT:
      return right;

    case FRAME:
      if (right === FRAME || right === INSTANT) {
        return left;
      }
      return right;

    case NEXT_FRAME:
      if (right === INSTANT || right === NEXT_FRAME) {
        return left;
      }
      return right;

    case IMMEDIATE:
      if (right === IMMEDIATE) {
        return IMMEDIATE;
      } else if (typeof right === "object") {
        return { ...right, [IMMEDIATE]: true };
      }
      return { [IMMEDIATE]: true, timer: right };

    default:
      switch (right) {
        case IMMEDIATE:
        case FRAME:
        case NEXT_FRAME:
        case INSTANT:
          return left;

        default:
          return standardise(mergeFinite(left, right));
      }
  }
}

export function advanceJestTimers(duration: Duration) {
  const rationalised = rationalise(duration);
  if (rationalised[IMMEDIATE]) {
    jest.runAllImmediates();
  }
  jest.advanceTimersByTime(rationalised.timer);
}

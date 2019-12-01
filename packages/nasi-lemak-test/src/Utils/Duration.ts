
/**
 * Duration.ts
 * @author Diao Zheng
 * @file Utilities functions that represent a non-instant period of time
 */

// @barrel export all

import { Compare } from "nasi-lemak";

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

export type Type = Duration;

export const TARGET_FRAMES_PER_SECOND = 60;

let frameDuration = 1000 / TARGET_FRAMES_PER_SECOND;

function standardise(duration: Duration): Duration {
  if (typeof duration === "object" && !duration[IMMEDIATE]) {
    return duration.timer;
  }
  return duration;
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

  }
}
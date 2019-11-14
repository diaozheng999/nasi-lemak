/**
 * CommitEffect.ts
 * @author Diao Zheng
 * @file Commits a side effect to be executed right before batching.
 */

import asap from "asap/raw";

/**
 * Use this to ensure that any effects is executed **after** the current Render
 * cycle.
 */
export const CommitEffect: (effect: () => void) => void =
  typeof setImmediate === "function" ?
    setImmediate
  :
    asap
;

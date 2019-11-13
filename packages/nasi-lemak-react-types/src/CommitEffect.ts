/**
 * CommitEffect.ts
 * @author Diao Zheng
 * @file Commits a side effect to be executed right before batching.
 */

import asap from "asap/raw";

/**
 * Use this to ensure that any effects is executed **after** the current Render
 * cycle.
 *
 * We use `setImmediate` with ASAP as fallback since React Native commits to
 * setImmediate at specific times in the render phase.
 * @see https://github.com/facebook/react-native/issues/1331
 */
export const CommitEffect =
  typeof document !== "undefined" ?
    // web
    setImmediate ?? asap
  : navigator?.product === "ReactNative" ?
    // React Native
    setImmediate
  :
    asap
;

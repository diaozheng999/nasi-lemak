/**
 * Duration.ts
 * @author Diao Zheng
 * @file Definitions for Side Effect Duration
 */

// @barrel export all

export const FRAME = Symbol("SideEffectExecutor/FRAME");
export const IMMEDIATE = Symbol("SideEffectExecutor/IMMEDIATE");
export const INSTANT = Symbol("SideEffectExecutor/INSTANT");
export const NEXT_FRAME = Symbol("SideEffectExecutor/NEXT_FRAME");

type Duration =
  | number
  | typeof FRAME
  | typeof NEXT_FRAME
  | typeof IMMEDIATE
  | typeof INSTANT
;

export type Type = Duration;

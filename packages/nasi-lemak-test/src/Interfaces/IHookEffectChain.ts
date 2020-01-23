/**
 * IHookEffectChain.ts
 * @author Diao Zheng
 * @file A SideEffectChain that's spawned as part of a hook
 */

import { Types } from "nasi-lemak";
import React from "react";

export interface IHookEffectChain<THook extends (...args: any[]) => any> {
  executeHook(
    ReactActual: typeof React,
    ...args: Types.ArgumentTupleType<THook>
  ): Types.ReturnType<THook>;
}

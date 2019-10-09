/**
 * IActionResponder.ts
 * @author Diao Zheng
 * @file A placeholder type that dictates an observable while we transfer over
 *       completely to rxjs.
 */

import React from "react";
import { IDispatchable } from "./DispatchComponent";

export interface IActionResponder<TIn, TOut> extends IDispatchable<TIn> {
  attach(handler: React.Dispatch<TOut>): { detach(): void };
}

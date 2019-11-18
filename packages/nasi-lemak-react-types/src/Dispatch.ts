/**
 * Dispatch.ts
 * @author Diao Zheng
 * @file Creating dispatch functions out of Redux Component Refs
 */

import React from "react";
import { Component } from "./Component";
import * as Stable from "./Stable";
import * as Types from "./Types";

export function Dispatch<T extends Component<any, any, any, any>>(
  ref: React.RefObject<T>,
): Stable.Dispatch<Types.PublicActionType<T>> {
  return Stable.declareAsStable((a) => {
    if (ref.current) {
      ref.current.sendAction(a);
    }
  });
}

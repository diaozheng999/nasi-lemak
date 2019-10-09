/**
 * Dispatch.ts
 * @author Diao Zheng
 * @file Creating dispatch functions out of Redux Component Refs
 */

import React from "react";
import { Component } from "./Component";
import * as Types from "./Types";

export function Dispatch<T extends Component<any, any, any, any>>(
  ref: React.RefObject<T>,
): React.Dispatch<Types.PublicActionType<T>> {
  return (a) => {
    if (ref.current) {
      ref.current.sendAction(a);
    }
  };
}

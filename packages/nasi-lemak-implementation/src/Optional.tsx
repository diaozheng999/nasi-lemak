/**
 * Optional.tsx
 * @author Diao Zheng
 * @file renders to some content iff predicate is truthy
 * @barrel component
 */
import React from "react";

export interface IOptionalProps {
  predicate: boolean;
  children: React.ReactElement;
}

export function Optional(props: IOptionalProps) {
  if (props.predicate) {
    return props.children;
  }
  return <></>;
}

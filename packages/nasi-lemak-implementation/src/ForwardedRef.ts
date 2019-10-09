/**
 * ForwardedRef.ts
 * @author Diao Zheng
 * @file A React hook to reconcile a fowaarded ref.
 * @barrel hook
 */

import React, { useLayoutEffect, useRef } from "react";

export function useForwardedRef<T>(forwardedRef: React.Ref<T>) {
  const previousRef = useRef<[T | null, React.Ref<T>]>([null, null]);
  const internalRef = useRef<T>(null);

  // called for the sake of compatibility, see:
  // https://reactjs.org/docs/refs-and-the-dom.html#caveats-with-callback-refs
  if (
    typeof forwardedRef === "function" && (
      internalRef.current !== previousRef.current[0] ||
      forwardedRef !== previousRef.current[1]
    )
  ) {
    forwardedRef(null);
  }

  useLayoutEffect(() => {
    if (typeof forwardedRef === "function") {
      forwardedRef(internalRef.current);
    }
  }, [ forwardedRef, internalRef.current ]);

  useLayoutEffect(() => {
    previousRef.current = [internalRef.current, forwardedRef];
  }, [forwardedRef, internalRef.current]);

  if (forwardedRef && typeof forwardedRef !== "function") {
    return forwardedRef;
  } else {
    return internalRef;
  }
}

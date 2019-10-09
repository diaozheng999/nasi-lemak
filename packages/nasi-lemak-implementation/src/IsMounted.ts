/**
 * IsMounted.ts
 * @author Diao Zheng
 * @file A simple hook to tell if the component is mounted.
 * @barrel hook
 */

import { useLayoutEffect, useRef } from "react";

/**
 * @deprecated
 * DO NOT USE. See
 * https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 */
export function useIsMounted() {
  const mounted = useRef(true);

  useLayoutEffect(() => () => {
    mounted.current = false;
  }, []);

  return () => mounted.current;
}

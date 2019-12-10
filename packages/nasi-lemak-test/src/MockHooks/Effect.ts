/**
 * Effect.ts
 * @author Diao Zheng
 * @file useEffect hook that uses SideEffectExecutor
 */

// @barrel hook

import {
  DependencyList,
  EffectCallback,
  useEffect as useEffectActual,
  useMemo,
} from "react";

export function useEffect(effect: EffectCallback, deps?: DependencyList) {
  const memoisedEffect = useMemo(() => effect, deps);
  
}

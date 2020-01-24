/**
 * MockReact.ts
 * @author Diao Zheng
 * @file Mock all functions in React
 */

import { Unique } from "nasi";
import { UseEffect } from "./EffectChains";
import { MockCreateElement, SpawnHook } from "./TestUtils";
import { ReactActual } from "./Utils";

export function MockReact(): unknown {
  return {
    ...ReactActual,
    __nltinternal_isMocked: true,
    createElement: MockCreateElement,
    useEffect: SpawnHook(UseEffect, new Unique("useEffect")),
  };
}
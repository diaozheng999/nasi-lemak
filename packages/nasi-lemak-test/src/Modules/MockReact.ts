/**
 * MockReact.ts
 * @author Diao Zheng
 * @file Mock all functions in React
 */

import { Unique } from "nasi";

export function MockReact(): unknown {
  const { UseEffect, UseReducer, UseState } = require("../EffectChains");
  const { SpawnHook } = require("../TestUtils");
  const { MockCreateElement, ReactActual } = require("../Utils");
  return {
    ...ReactActual,
    __nltinternal_isMocked: true,
    createElement: MockCreateElement,
    useEffect: SpawnHook(UseEffect, new Unique("useEffect")),
    useReducer: SpawnHook(UseReducer, new Unique("useReducer")),
    useState: SpawnHook(UseState, new Unique("useState")),
  };
}

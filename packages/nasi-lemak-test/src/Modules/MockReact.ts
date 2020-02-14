/**
 * MockReact.ts
 * @author Diao Zheng
 * @file Mock all functions in React
 */

import { Unique } from "nasi";
import { MockModule } from "./MockModule";

export const MockReact = MockModule(() => {
  const { UseEffect, UseReducer, UseState } = require("../EffectChains");
  const { SpawnHook } = require("../TestUtils");
  const { ReactActual } = require("../Utils");
  const { MockCreateElement } = require("../TestUtils");
  return {
    ...ReactActual,
    __nltinternal_isMocked: true,
    createElement: MockCreateElement(ReactActual),
    useEffect: SpawnHook(UseEffect, new Unique("useEffect")),
    useReducer: SpawnHook(UseReducer, new Unique("useReducer")),
    useState: SpawnHook(UseState, new Unique("useState")),
  };
});

/**
 * MockNasiLemakImpl.ts
 * @author Diao Zheng
 * @file Mock all functions in nasi-lemak-implementation
 */

import { Unique } from "nasi";
import { UseAsyncReducer } from "../EffectChains";
import { SpawnHook } from "../TestUtils";

export function MockNasiLemakImpl(): unknown {
  const actual = jest.requireActual("nasi-lemak-implementation");
  return {
    ...actual,
    __nltinternal_isMocked: true,
    useAsyncReducer: SpawnHook(UseAsyncReducer, new Unique("useAsyncReducer")),
  };
}

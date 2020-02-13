/**
 * CurrentExecutor.ts
 * @author Diao Zheng
 * @file Current running executor.
 */

import { Box, Lazy } from "nasi-lemak";
import { RootEffectChain, SideEffectChain } from "../EffectChains";

export class CurrentExecutor extends Box<SideEffectChain> {

  public static readonly shared = Lazy(() => new CurrentExecutor());

  private constructor() {
    super(RootEffectChain.current);
  }

  public valueOf() {
    return this.value ?? RootEffectChain.current;
  }
}

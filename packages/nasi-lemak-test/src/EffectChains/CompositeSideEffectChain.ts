/**
 * CompositeSideEffectChain.ts
 * @author Diao Zheng
 * @file The basis of a side effect chain that combines 2 or more effects
 */

import { SideEffectChain } from "./SideEffectChain";
import { IDescribable } from "../Interfaces";
import { Unique } from "nasi";

export abstract class CompositeSideEffectChain<
  TChainMapping extends Record<string, SideEffectChain>
>
extends SideEffectChain
{
  protected abstract readonly executionOrder: Array<keyof TChainMapping>;
  protected abstract readonly types: {
    [key in keyof TChainMapping]:
      new (
        spawnedBy: IDescribable,
        generator?: Unique,
        persistent?: boolean,
      ) => SideEffectChain;
  };
}

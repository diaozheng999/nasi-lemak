/**
 * RootEffectChain.ts
 * @author Diao Zheng
 * @file This is the global root effect chain
 */

import { Disposable, Unique } from "nasi-lemak";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { ConcurrentSideEffectChain } from "./ConcurrentSideEffectChain";
import { RoundRobinSideEffectChain } from "./RoundRobinSideEffectChain";
import { SerialSideEffectChain } from "./SerialSideEffectChain";
import { SideEffectChain } from "./SideEffectChain";

const Root: IDescribable = {
  describe: () => "ROOT",
  getId: () => "ROOT",
  owner: () => undefined,
};

export type RootEffectChainExecutionType =
  | "SERIAL"
  | "ROUND_ROBIN"
  | "CONCURRENT"
;

export const RootEffectChain: {
  current: SideEffectChain;
  create(type: RootEffectChainExecutionType): void;
  executeAllPendingEffects(chain?: SideEffectChain): void;
} = {
  current: new ConcurrentSideEffectChain(
    Root,
    new Unique("ConcurrentRoot"),
    true,
  ),

  create(type) {
    if (this.current) {
      Disposable.dispose(this.current);
    }

    switch (type) {
      case "CONCURRENT":
        this.current = new ConcurrentSideEffectChain(
          Root,
          new Unique("ConcurrentRoot"),
          true,
        );
        break;
      case "ROUND_ROBIN":
        this.current = new RoundRobinSideEffectChain(
          Root,
          new Unique("RoundRobinRoot"),
          true,
        );
        break;
      case "SERIAL":
        this.current = new SerialSideEffectChain(
          Root,
          new Unique("SerialRoot"),
          true,
        );
        break;
    }
  },

  executeAllPendingEffects(chain?: SideEffectChain) {
    const sideEffectChain = chain ?? this.current;

    while (!sideEffectChain.isSuspendedOrComplete()) {
      Duration.advanceJestTimers(sideEffectChain.execute());
    }
  },
};

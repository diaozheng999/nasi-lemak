
/**
 * SideEffectExecutor.ts
 * @author Diao Zheng
 * @file Enable old-style executors
 */

import { LegacyCompatChain, RootEffectChain } from "./EffectChains";
import { IDescribable } from "./Interfaces";
import { Duration } from "./Utils";

export class SideEffectExecutor implements IDescribable {

  public static current: SideEffectExecutor;

  public static setupEnvironment() {
    // tslint:disable-next-line: no-console
    console.log(
      "SideEffectExecutor.setupEnvironment is no longer required. " +
      "Add dist/cjs/Setup.js (or dist/esm/Setup.js) to jest config instead.",
    );
  }

  public static createNewQueue() {
    RootEffectChain.create("CONCURRENT");
  }

  private legacyChain: LegacyCompatChain;

  constructor() {
    SideEffectExecutor.current = this;
    this.legacyChain = new LegacyCompatChain(this, undefined, true);
    RootEffectChain.current.enqueue(this.legacyChain);
  }

  public getId() {
    return "SideEffectExecutor";
  }

  public describe(linePrefix: string, abbreviate?: boolean) {
    return RootEffectChain.current.describe(linePrefix, abbreviate);
  }

  public owner() {
    return undefined;
  }

  public executeAllSynchronousEffects(__?: any) {
    this.printNoLongerRequiredMessage("executeAllSynchronousEffects");
  }

  public executePendingEffectsUntil(...__: any[]) {
    this.printNoLongerRequiredMessage("executePendingEffectsUntil");
  }

  public executeQueuedEffectsOnly(...__: any[]) {
    // tslint:disable-next-line:no-console
    console.warn(
      "SideEffectExecutor.executeQueuedEffectsOnly is no longer used." +
      "Please use RootEffectChain.current.execute() to execute one step.",
    );
  }

  public executeAllPendingEffects(__?: any) {
    RootEffectChain.executeAllPendingEffects();
  }

  public step(__?: any) {
    Duration.advanceJestTimers(RootEffectChain.current.execute());
  }

  private printNoLongerRequiredMessage(functionName: string) {
    // tslint:disable-next-line:no-console
    console.warn(
      `SideEffectExecutor.${functionName} is no longer used.` +
      "Please use the jest matchers instead.\n" +
      "See: \n" +
      " - Matchers/SideEffectMatcher.d.ts\n" +
      " - Matchers/SideEffectChainMatcher.d.ts\n",
    );
  }
}

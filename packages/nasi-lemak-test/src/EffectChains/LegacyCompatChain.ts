/**
 * LegacyCompatChain.ts
 * @author Diao Zheng
 * @file This is a SideEffectExecutor effect chain
 */

import renderer from "react-test-renderer";
import { LegacySideEffect, LegacySideEffectType } from "../Effects";
import { SerialSideEffectChain } from "./SerialSideEffectChain";

const ERROR_IF_PROMISE_REQUEUED_COUNT = 100000;

function isEffectDone(effect: LegacySideEffectType): boolean {
  return (!!effect.done) && effect.childEffects.every(isEffectDone);
}

function isEffectExecutable(effect: LegacySideEffectType) {
  return effect.dependsOn.every(isEffectDone);
}

export class LegacyCompatChain extends SerialSideEffectChain {

  public lastExecutedEffect: LegacySideEffectType | undefined;

  public enqueueLegacy(spec: LegacySideEffectType) {
    const effect = new LegacySideEffect(spec);
    effect.__internal_setExecutor(this.executeLegacy.bind(this));
    this.enqueue(effect);
  }

  private executeLegacy(effect: LegacySideEffectType | undefined) {
    if (effect) {
      if (!isEffectExecutable(effect)) {
        this.requeueLegacy(effect);
        return;
      }

      if (effect.immediateAction) {
        if (effect.willRerender) {
          renderer.act(effect.immediateAction);
        } else {
          effect.immediateAction();
        }
      }
      if (effect.promise) {
        if ((effect.promise as any).isPending()) {
          jest.runAllImmediates();
          jest.runAllTimers();
          jest.runAllTicks();
          this.requeueLegacy(effect);
          return;
        }
      }
      effect.done = true;
    }
    try {
      jest.runAllTimers();
    } catch (e) {
      throw new Error(
        `Possible infinite timer resulting from executing Side Effect:\n` +
        `This effect: ${this.printEffectLegacy(effect)}\n` +
        `Last effect: ${this.printEffectLegacy(this.lastExecutedEffect)}`,
      );
    }
    this.lastExecutedEffect = effect;
  }

  /**
   * Requeues an effect after it's been popped. This will update the internal
   * requeue counter. Once a generous amount of requeues have already, this
   * function will throw an error.
   * @param effect The effect to be re-enqueued to the back of the execution
   * queue.
   */
  private requeueLegacy(effect: LegacySideEffectType) {
    if (!effect.requeueTimes) {
      effect.requeueTimes = 0;
    }
    if (++effect.requeueTimes > ERROR_IF_PROMISE_REQUEUED_COUNT) {
      // tslint:disable-next-line: no-console
      console.error("Side effect:", effect);
      throw new Error(
        `Side Effect was not done after being requeued ` +
        ERROR_IF_PROMISE_REQUEUED_COUNT +
        ` times. Is there some infinite loop?`,
      );
    }
    this.enqueueLegacy(effect);
  }

  private printEffectLegacy(effect?: LegacySideEffectType) {
    if (!effect) {
      return "<noop>";
    }
    const debugInfo = JSON.stringify(
      effect!.zzAdditionalDebugInfo,
      undefined,
      2,
    );
    return (
      `action:${effect!.action.action} from:${effect!.cameFrom![0]}\n` +
      `debug_info:${debugInfo}`
    );
  }
}

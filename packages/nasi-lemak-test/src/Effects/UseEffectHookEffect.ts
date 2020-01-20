/**
 * UseEffectHookEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that represents a UseEffect hook
 */

import { EffectCallback } from "react";
import { AttachedSideEffect } from "./AttachedSideEffect";

export class UseEffectHookEffect extends AttachedSideEffect<EffectCallback> {
  public readonly kind = "USE_EFFECT_HOOK_EFFECT";
}

/**
 * UseEffectHookCleanupEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that represents a UseEffect hook cleanup effect
 */

import { SideEffect } from "./SideEffect";

export class UseEffectHookCleanupEffect extends SideEffect {
  public readonly kind = "USE_EFFECT_HOOK_CLEANUP_EFFECT";

  protected describeEffect() {
    return `UseEffectHookCleanup ${this.getId()}`;
  }
}

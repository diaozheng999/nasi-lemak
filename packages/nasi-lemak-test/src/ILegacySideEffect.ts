/**
 * ILegacySideEffect.ts
 * @author Diao Zheng
 * @file The old side effect interface
 */

export interface ISideEffect {
  /**
   * Whether this effect will trigger a React DOM rerender. The executor will
   * wrap this in a `renderer.act()` call if this is the case.
   */
  willRerender: boolean;
  /**
   * Optional metadata that indicates where the side effect is being called
   * from.
   *
   * In case of components, it will be a tuple `[ string, Element ]` where the
   * first element is the identity of the element (i.e. `Loader@1f4dba4`) and
   * the second being the actual element.
   */
  cameFrom?: any;
  /**
   * Metadata that may indicate an action that's being applied.
   */
  action: any;
  /**
   * Metadata that holds the current state that it's being applied on.
   */
  state: any;
  /**
   * The thunk that needs to be executed immediately.
   */
  immediateAction?: () => void;
  /**
   * The side effects to be completed before we can even execute this effect.
   */
  dependsOn: ISideEffect[];
  /**
   * The parent effect that spawns this effect.
   */
  spawnedBy?: ISideEffect;
  /**
   * A list of child effects that this spawns. Should another effect depends
   * on the completion of this effect, it will also depend on the completion
   * of all pending effects within this list.
   */
  childEffects: ISideEffect[];
  /**
   * Whether this effect has been completed.
   */
  done?: boolean;
  /**
   * Indicates an ongoing long-running process. This is assumed to be an
   * fbjs promise. We use without discrimmination fbjs methods to force
   * synchronity of this promise to assert certain aspects of this promise.
   */
  promise?: Promise<void>;
  /**
   * The number of times this effects has been requeued back into the current
   * side effect queue. Should this exceed some generous amount, we will halt
   * and prompt a specific error.
   */
  requeueTimes?: number;
  /**
   * Additional debug information contained that would be of interest to the
   * developer. This is prefixed with `zz` in this way so that when printed
   * with Jest this appears as the last property.
   */
  zzAdditionalDebugInfo?: any;
}

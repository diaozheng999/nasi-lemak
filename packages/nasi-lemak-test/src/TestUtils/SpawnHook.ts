/**
 * SpawnHook.ts
 * @author Diao Zheng
 * @file A Describable spawner that represents the hook
 */

import { Option, Types, Unique } from "nasi-lemak";
import {
  ConcurrentSideEffectChain,
  RootEffectChain,
  SideEffectChain,
} from "../EffectChains";
import { IDescribable, IHookEffectChain } from "../Interfaces";
import { ReactActual, useHookSpawner } from "../Utils";

let currentExecutor: Option.Type<ConcurrentSideEffectChain>;

export function __internal_setCurrentExecutor(
  executor?: ConcurrentSideEffectChain,
) {
  const previousExecutor = currentExecutor;
  currentExecutor = executor;
  return previousExecutor;
}

export function __internal_getCurrentExecutor() {
  return currentExecutor ?? RootEffectChain.current;
}

export function SpawnHook<
  THook extends (...args: any[]) => any
>(
  EffectChain: new (
    spawnedBy: IDescribable,
    spawner?: Unique,
    id?: string,
  ) => IHookEffectChain<THook> & SideEffectChain,
  spawner?: Unique,
  id?: string,
): THook {

  const constructHook: any = (...args: Types.ArgumentTupleType<THook>) => {

    const [ hookId ] = ReactActual.useState(
      () => (spawner ?? (new Unique("Hook"))).string,
    );

    const spawnerDesc = useHookSpawner(hookId);

    const [ chain ] = ReactActual.useState(
      () => {
        const executor = currentExecutor ?? RootEffectChain.current;
        const effectChain = new EffectChain(spawnerDesc, spawner, id);
        executor.enqueue(effectChain);
        return effectChain;
      },
    );

    ReactActual.useLayoutEffect(() => () => {
      chain.deactivate();
    }, []);

    return chain.executeHook(ReactActual, ...args);
  };

  return constructHook;
}

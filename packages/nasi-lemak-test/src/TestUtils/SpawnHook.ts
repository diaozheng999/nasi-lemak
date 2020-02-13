/**
 * SpawnHook.ts
 * @author Diao Zheng
 * @file A Describable spawner that represents the hook
 */

import { Disposable, Types, Unique } from "nasi-lemak";
import { SideEffectChain } from "../EffectChains";
import { IDescribable, IHookEffectChain } from "../Interfaces";
import { ReactActual, useHookSpawner } from "../Utils";
import { CurrentExecutor } from "./CurrentExecutor";

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
        const executor = CurrentExecutor.shared.value.valueOf();
        const effectChain = new EffectChain(spawnerDesc, spawner, id);
        executor.enqueue(effectChain);
        return effectChain;
      },
    );

    ReactActual.useLayoutEffect(() => () => Disposable.dispose(chain), []);

    return chain.executeHook(ReactActual, ...args);
  };

  return constructHook;
}
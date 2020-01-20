/**
 * HookSpawner.ts
 * @author Diao Zheng
 * @file A Describable spawner that represents the hook
 */

// @barrel hook

import { IDescribable } from "../Interfaces";

export function useHookSpawner(id: string): IDescribable {
  const stack = new Error().stack!.split("\n");
  stack.shift();
  stack.shift();
  const lineOne = stack.shift()?.trim();
  return {
    describe(linePrefix) {
      return (
        `${id} hook: ${lineOne}\n` +
        stack.map((s) => `${linePrefix}         ${s}`).join("\n")
      );
    },
    getId: () => id,
    owner: () => undefined,
  };
}

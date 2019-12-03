
/**
 * TestSpawner.ts
 * @author Diao Zheng
 * @file A spawner that describes the current test
 */

import { Unique } from "nasi-lemak";
import { IDescribable } from "../Interfaces";

export function TestSpawner(): IDescribable {
  const stack = new Error().stack!.split("\n");
  stack.shift();
  stack.shift();
  const lineOne = stack.shift()?.trim();
  const testId = new Unique("Test").opaque;
  return {
    describe(linePrefix) {
      return (
        `current test ${lineOne}\n` +
        stack.map((s) => `${linePrefix}         ${s}`).join("\n")
      );
    },
    getId: () => testId,
    owner: () => undefined,
  };
}

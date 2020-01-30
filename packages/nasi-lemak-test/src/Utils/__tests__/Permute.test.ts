/**
 * Permute.test.tsx
 * @author Diao Zheng
 * @file Test cases for the testtime utility function permute.
 */

import { permute } from "../Permute";

describe("permutation", () => {
  function expectResult<T>(results: Iterable<T[]>) {
    return {
      toBeAllPermutationsOf(list: T[]) {

        const resultArray = [];

        for (const result of results) {
          expect(result.length).toBe(list.length);
          resultArray.push(result);
          for (const elem of list) {
            expect(result).toContain(elem);
          }
        }

        for (let i = 0; i < resultArray.length; ++i) {
          for (let j = 0; j < resultArray.length; ++j) {
            if (i !== j) {
              expect(resultArray[i]).not.toStrictEqual(resultArray[j]);
            }
          }
        }
      },
    };
  }

  test("single item", () => {
    expect(Array.from(permute([1]))).toStrictEqual([[1]]);
  });

  test("two items", () => {
    const list = [1, 2];
    const results = Array.from(permute([1, 2]));
    expect(results.length).toBe(2);
    expectResult(results).toBeAllPermutationsOf(list);
  });

  test("three items", () => {
    const list = [1, 2, 3];
    const results = Array.from(permute(list));
    expect(results.length).toBe(6);
    expectResult(results).toBeAllPermutationsOf(list);
  });

  test("multiple items", () => {
    const list = [1, 2, 3, 4, 5];
    const results = Array.from(permute(list));
    expect(results.length).toBe(120);
    expectResult(results).toBeAllPermutationsOf(list);
  });
});

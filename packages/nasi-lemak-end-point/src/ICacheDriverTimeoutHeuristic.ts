/**
 * ICacheDriverTimeoutHeuristic.ts
 * @author Diao Zheng
 * @file Timeout heuristic for a cache driver.
 * @ignore_test
 */

export interface ICacheDriverTimeoutHeuristic {
  currentTimeout: number;
  update(newDuration: number): void;
}

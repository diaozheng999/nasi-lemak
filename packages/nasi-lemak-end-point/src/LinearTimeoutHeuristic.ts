/**
 * LinearTimeoutHeuristic.ts
 * @author Diao Zheng
 * @file defines a linear timeout heuristic
 */

import { ICacheDriverTimeoutHeuristic } from "./ICacheDriverTimeoutHeuristic";

export class LinearTimeoutHeuristic implements ICacheDriverTimeoutHeuristic {
  private cacheExpiry: number;
  private cacheHeuristicRememberFactor: number;
  private cacheHeuristicForgetFactor: number;

  public constructor(
    initialValue: number = 5000,
    remember: number = 1.4,
    forget: number = 0.3,
  ) {
    this.cacheExpiry = initialValue;
    this.cacheHeuristicRememberFactor = remember;
    this.cacheHeuristicForgetFactor = forget;
  }

  public get currentTimeout() {
    return this.cacheExpiry;
  }

  public update(timeSpent: number) {
    this.cacheExpiry *= this.cacheHeuristicForgetFactor;
    this.cacheExpiry += timeSpent * this.cacheHeuristicRememberFactor;
  }
}

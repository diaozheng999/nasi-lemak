/**
 * MemoryCacheDriver.ts
 * @author Diao Zheng
 * @file An in-memory cache driver with custom cache timeout heuristics
 */

import _ from "lodash";
import { MemoryCache, Option } from "nasi";
import { map } from "rxjs/operators";
import { ICacheDriver } from "./ICacheDriver";
import { ICacheDriverTimeoutHeuristic } from "./ICacheDriverTimeoutHeuristic";
import { LinearTimeoutHeuristic } from "./LinearTimeoutHeuristic";

export class MemoryCacheDriver<T, K> implements ICacheDriver<T, K> {
  private heuristic: ICacheDriverTimeoutHeuristic;

  constructor(heuristic?: ICacheDriverTimeoutHeuristic) {
    this.heuristic = heuristic ?? new LinearTimeoutHeuristic();
  }

  public get get() {
    return map<K, Option.Type<T>>((key: K) => MemoryCache.get(key, _.isEqual));
  }

  public get set() {
    return map(([ key, value ]: [ K, T ]) => {
      MemoryCache.set(key, value, Date.now() + this.heuristic.currentTimeout);
      return value;
    });
  }

  public updateHeuristic = (value: number) => {
    this.heuristic.update(value);
  }

}

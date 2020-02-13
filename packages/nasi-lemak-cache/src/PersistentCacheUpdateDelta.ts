/**
 * PersistentCacheUpdateDelta.ts
 * @author Diao Zheng
 * @file Delta object for PersistentCache.
 * @barrel ignore
 */

export type UpdateType =
  | { type: "SET", value: string }
  | { type: "REMOVE" }
  | { type: "NEW" }
  | { type: "REMOVE_KEY" }
;

export class PersistentCacheUpdateDelta<T> {

  public static mergeWith<T>(
    delta1: PersistentCacheUpdateDelta<T>,
    delta2: PersistentCacheUpdateDelta<T>,
  ): PersistentCacheUpdateDelta<T>
  {
    delta2.keys.forEach((value, key) => {
      delta1.keys.set(key, value);
    });
    return delta1;
  }

  private keys: Map<T, UpdateType>;

  constructor() {
    this.keys = new Map();
  }

  public addRemoveDelta(key: T) {
    this.keys.set(key, { type: "REMOVE" });
  }

  public addSetDelta(key: T, value: string) {
    this.keys.set(key, { type: "SET", value });
  }

  public addNewKeyDelta(key: T) {
    this.keys.set(key, { type: "NEW" });
  }

  public addRemoveKeyDelta(key: T) {
    this.keys.set(key, { type: "REMOVE_KEY" });
  }

  public *getRemoves<U>(keyComposer: (key: T) => U | undefined) {
    for (const [key, value] of this.keys.entries()) {
      if (value.type === "REMOVE") {
        const composed = keyComposer(key);
        if (composed) {
          yield composed;
        }
      }
    }
  }

  public *getSets<U>(keyComposer: (key: T) => U | undefined) {
    for (const [key, value] of this.keys.entries()) {
      if (value.type === "SET") {
        const composed = keyComposer(key);
        if (composed) {
          yield [ composed, value.value ] as [ U, string ];
        }
      }
    }
  }

  public *getNewKeys<U>(keyComposer: (key: T) => U | undefined) {
    for (const [key, value] of this.keys.entries()) {
      if (value.type === "NEW") {
        const composed = keyComposer(key);
        if (composed) {
          yield composed;
        }
      }
    }
  }

  public *getRemoveKeys<U>(keyComposer: (key: T) => U | undefined) {
    for (const [key, value] of this.keys.entries()) {
      if (value.type === "REMOVE_KEY") {
        const composed = keyComposer(key);
        if (composed) {
          yield composed;
        }
      }
    }
  }
}

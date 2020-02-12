/**
 * PersistentCache.ts
 * @author Diao Zheng
 * @file Cache that persists across multiple invokes of the app
 */

import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";
// FIXME: Nasi Lemak doesn't export Lazy yet
import { Lazy } from "nasi";
import {
  Dev,
  Hashing,
  Integer,
  isSerialisable,
  MemoryCache,
  Mutex,
  Option,
  requires,
} from "nasi-lemak";
import { IPersistentCacheOptions } from "./IPersistentCacheOptions";
import { PersistentCacheUpdateDelta } from "./PersistentCacheUpdateDelta";

const PCACHE_VERSION_IDENTIFIER = "2";

const INTERNAL_PREFIX = "internal://";
const EXTERNAL_PREFIX = "cache://";

type MetaType =
  | "HASH"
  | "VALUE"
  | "NEW_KEY"
  | "EXPIRY"
  | "REMOVE_KEY"
;

interface ICacheMetadata {
  expiry?: number;
  hash: string;
}

export interface IPersistentCacheLine<T> {
  value: T;
  hash: string;
}

export class PersistentCache {
  public static useActualImplementationAtTestTime = false;
  public static shared = Lazy(() => new PersistentCache());

  private options: Required<IPersistentCacheOptions>;
  private available: boolean = true;
  private hashContext1: Hashing.IContext = Hashing.getCurrentContext();
  private hashContext2: Hashing.IContext = Hashing.getCurrentContext();
  private metadata: Map<string, ICacheMetadata> = new Map();

  private queuedUpdates: Array<[
    string,
    any,
    Option.Type<number>,
    string,
    () => void,
    (obj: any) => string,
  ]> = [];

  private initialisationLock = new Mutex();
  private writeLock = new Mutex();

  constructor(options?: IPersistentCacheOptions) {
    this.options = {
      keyPrefix: options?.keyPrefix ?? EXTERNAL_PREFIX,
      metaPrefix: options?.metaPrefix ?? INTERNAL_PREFIX,
      useAsyncStorage: options?.useAsyncStorage ?? false,
      version: options?.version ?? PCACHE_VERSION_IDENTIFIER,
    };

    if (
      this.options.useAsyncStorage &&
      !PersistentCache.useActualImplementationAtTestTime
    ) {
      this.available = false;
    } else {
      this.initialisationLock.lock(() => this.writeLock.lock(this.initialise));
    }
  }

  public hash(obj: any): Integer.Type {
    return Hashing.hash(obj, this.hashContext1);
  }

  public async getInitialisationAwaiter() {
    return this.initialisationLock.UNSAFE_AcquireReadonlyAccess();
  }

  public async setAsync<T>(
    key: () => string,
    obj: T,
    expiry?: number,
    externalHash?: string,
    serialiser: (obj: T) => string = JSON.stringify,
  ) {
    try {
      await this.initialisationLock.UNSAFE_AcquireReadonlyAccess();
    } catch {
      // do nothing
    }
    return this.set(key(), obj, expiry, externalHash, serialiser);
  }

  @requires((__, obj) => isSerialisable(obj))
  public async set<T>(
    key: string,
    obj: T,
    expiry?: number,
    externalHash?: string,
    serialiser: (obj: T) => string = JSON.stringify,
  ) {
    // no point setting some expired item
    if (Option.isSome(expiry) && expiry < new Date().getTime()) {
      return;
    }
    await this.initialisationLock.UNSAFE_AcquireReadonlyAccess();

    if (!this.available) {
      return MemoryCache.set(
        this.external(key),
        { value: obj, hash: this.UNSAFE_hash(obj, externalHash) },
        expiry,
      );
    }

    return new Promise((resolve) => {
      this.queuedUpdates.push([
        key,
        obj,
        expiry,
        this.UNSAFE_hash(obj, externalHash),
        resolve,
        serialiser,
      ]);
      setImmediate(this.flushQueuedUpdates);
    });
  }

  public async getHash(key: string): Promise<Option.Type<string>> {
    await this.initialisationLock.UNSAFE_AcquireReadonlyAccess();
    if (!this.available) {
      const result = await this.get(key);
      return Option.map(result, (line) => line.hash);
    }
    const metadata = this.metadata.get(key);
    if (metadata) {
      return metadata.hash;
    }
    return undefined;
  }

  public async getAsync<T>(
    key: () => string,
    deserialise?: (content: string) => Option.Type<T>,
  ) {
    try {
      await this.initialisationLock.UNSAFE_AcquireReadonlyAccess();
    } catch {
      // do nothing
    }
    return this.get(key(), deserialise);
  }

  public async get<T>(
    key: string,
    deserialise: (content: string) => Option.Type<T> = JSON.parse,
  ): Promise<Option.Type<IPersistentCacheLine<T>>> {
    try {
      await this.initialisationLock.UNSAFE_AcquireReadonlyAccess();
      await this.writeLock.UNSAFE_AcquireReadonlyAccess();

      if (!this.available) {
        return MemoryCache.get(this.external(key));
      }

      const metadata = this.metadata.get(key);

      // not present
      if (!metadata) {
        return;
      }

      // expired
      if (metadata.expiry && metadata.expiry < new Date().getTime()) {
        this.writeLock.lock(() => this.UNSAFE_removeOne(key));
        return;
      }

      // has value
      const item = await AsyncStorage.getItem(this.external(key));
      if (!item) {
        return;
      }

      // deserialisation successful
      const value = deserialise(item);
      if (value === undefined) {
        return;
      }

      return {
        hash: metadata.hash,
        value,
      };

    } catch {
      return Option.map(MemoryCache.get<T, string>(key), (value) => ({
        hash: "",
        value,
      }));
    }

  }

  private generateDelta(
    key: string,
    obj: any,
    hash: string,
    serialiser: (s: any) => string,
    expiry?: number,
  ): PersistentCacheUpdateDelta<[ string, MetaType ]> {

    // no point setting some expired item
    if (Option.isSome(expiry) && expiry < new Date().getTime()) {
      return new PersistentCacheUpdateDelta();
    }

    const metadata = this.metadata.get(key);
    const delta = this.generateExpiryDelta(key, expiry, metadata);

    if (metadata) {
      if (metadata.hash === hash) {
        return delta;
      }
    } else {
      delta.addNewKeyDelta([key, "NEW_KEY"]);
    }

    delta.addSetDelta([key, "HASH"], hash);
    delta.addSetDelta([key, "VALUE"], serialiser(obj));

    return delta;
  }

  private generateExpiryDelta(
    key: string,
    expiry?: number,
    metadata?: ICacheMetadata,
  ) {
    const delta = new PersistentCacheUpdateDelta<[ string, MetaType ]>();

    if (Option.isSome(expiry)) {
      delta.addSetDelta([ key, "EXPIRY" ], expiry.toString(10));
    } else if (metadata && metadata.expiry) {
      delta.addRemoveDelta([ key, "EXPIRY" ]);
    }

    return delta;
  }

  private UNSAFE_hash(obj: any, externalHash?: string) {
    if (Option.isSome(externalHash)) {
      return externalHash;
    }

    if (this.available) {
      const hash1 = Hashing.hash(obj, this.hashContext1).toString(16);
      const hash2 = Hashing.hash(obj, this.hashContext2).toString(16);
      return `${hash1}${hash2}`;
    }
    return "";
  }

  private flushQueuedUpdates = async () => {
    await this.initialisationLock.UNSAFE_AcquireReadonlyAccess();
    await this.writeLock.lock(this.UNSAFE_flushQueuedUpdates.bind(this));
  }

  private async UNSAFE_flushQueuedUpdates() {
    if (!this.queuedUpdates.length) {
      return;
    }

    const snapshotUpdates = [];

    while (this.queuedUpdates.length) {
      const update = this.queuedUpdates.shift();
      if (update) {
        snapshotUpdates.push(update);
      }
    }

    try {
      const delta = (
        snapshotUpdates
          .map(
            ([ key, obj, expiry, hash, __, serialiser ]) =>
              this.generateDelta(key, obj, hash, serialiser, expiry),
          )
          .reduceRight(PersistentCacheUpdateDelta.mergeWith)
      );
      // update AsyncStorage
      await AsyncStorage.multiRemove(
        Array.from(delta.getRemoves(this.compose)),
      );
      await AsyncStorage.multiSet(
        Array.from(delta.getSets(this.compose)),
      );
      const existingKeys = Array.from(this.metadata.keys());
      for (const newKey of delta.getNewKeys(this.composeNewKey)) {
        existingKeys.push(newKey);
      }

      await AsyncStorage.setItem(
        this.internal("KEYS"),
        JSON.stringify(existingKeys),
      );

      // update metadata
      for (const newKey of delta.getNewKeys(this.composeNewKey)) {
        this.metadata.set(newKey, { hash: "" });
      }

      for (
        const [ key, type ] of delta.getRemoves<[string, MetaType]>(_.identity)
      ) {
        this.updateMetadata(key, type, undefined);
      }

      for (
        const [
          [ key, type ],
          value,
        ] of delta.getSets<[string, MetaType]>(_.identity)
      ) {
        this.updateMetadata(key, type, value);
      }

    } catch (e) {
      Dev.devOnly(
        // tslint:disable-next-line: no-console
        console.warn,
        "PersistentCache: UNSAFE_flushQueuedUpdates received error: ",
        e,
      );

      for (const [ key, obj ] of snapshotUpdates) {
        MemoryCache.set(key, obj);
      }
    } finally {
      for (const update of snapshotUpdates) {
        update[4]();
      }
    }
  }

  private async UNSAFE_removeOne(key: string) {
    try {
      const metadata = this.metadata.get(key);
      if (!metadata) {
        return;
      }
      await AsyncStorage.multiRemove([
        this.external(key),
        this.internal(this.meta(key, "HASH")),
      ]);
      if (metadata.expiry) {
        await AsyncStorage.removeItem(this.internal(this.meta(key, "EXPIRY")));
      }

      const newKeys = Array.from(this.metadata.keys()).filter((k) => k !== key);

      await AsyncStorage.setItem(
        this.internal("KEYS"), JSON.stringify(newKeys),
      );
    } catch (e) {
      Dev.devOnly(
        // tslint:disable-next-line: no-console
        console.warn,
        "PersistentCache: UNSAFE_removeOne received error ",
        e,
      );
    }
  }

  private updateMetadata = (
    key: string,
    metaType: MetaType,
    value?: string,
  ) => {
    const metadata = this.metadata.get(key);
    if (metadata) {
      switch (metaType) {
        case "HASH":
          if (value) {
            metadata.hash = value;
          }
          return;
        case "EXPIRY":
          metadata.expiry = Option.map(value, (s) => parseInt(s, 10));
          return;
      }
    }
  }

  private composeNewKey = (key: [ string, MetaType ]) => {
    if (key[1] === "NEW_KEY") {
      return key[0];
    }
    return;
  }

  private compose = (key: [ string, MetaType ]) => {
    switch (key[1]) {
      case "NEW_KEY":
      case "REMOVE_KEY":
        return;
      case "VALUE":
        return this.external(key[0]);
      default:
        return this.meta(key[0], key[1]);
    }
  }

  private internal(key: string) {
    return `${this.options.metaPrefix}/${key}`;
  }

  private meta(key: string, meta: "EXPIRY" | "HASH") {
    return this.internal(`${meta}/${key}`);
  }

  private external(key: string) {
    return `${this.options.keyPrefix}/${key}`;
  }

  private initialise = async () => {
    try {
      const storedVersion = await AsyncStorage.getItem(
        this.internal("VERSION_IDENTIFIER"),
      );
      if (storedVersion !== this.options.version) {
        if (storedVersion === null) {
          return this.initialiseAsyncStorage();
        }
        throw new Error("PCACHE version mismatch.");
      }
      const results = await AsyncStorage.multiGet([
        this.internal("HASH_CONTEXT_1"),
        this.internal("HASH_CONTEXT_2"),
        this.internal("KEYS"),
      ]);

      const internalContext = Hashing.getCurrentContext();
      const now = new Date().getTime();

      const storedKeys: string[] = [];
      const expiredKeys: string[] = [];

      for (const [ key, value ] of results) {
        switch (key) {
          case this.internal("HASH_CONTEXT_1"):
            if (value) {
              const context = JSON.parse(value);
              if (Hashing.validateContext(context)) {
                this.hashContext1 = context;
              }
            }
            break;
          case this.internal("HASH_CONTEXT_2"):
            if (value) {
              const context2 = JSON.parse(value);
              if (Hashing.validateContext(context2)) {
                this.hashContext2 = context2;
              }
            }
            break;
          case this.internal("KEYS"):
            if (value) {
              for (const k of JSON.parse(value)) {
                storedKeys.push(k);
              }
            }
        }
      }
      if (
        this.hashContext1 === internalContext ||
        this.hashContext2 === internalContext
      ) {
        throw new Error("PCACHE hash context mismatch.");
      }

      for (const [ key, value ] of await AsyncStorage.multiGet([
        ...storedKeys.map((cachekey) => this.meta(cachekey, "HASH")),
        ...storedKeys.map((cachekey) => this.meta(cachekey, "EXPIRY")),
      ])) {
        const [ identifier, meta, cachekey ] = key.split("/");
        if (identifier !== this.options.metaPrefix) {
          throw new Error("PCACHE meta key mismatch.");
        }

        const staged = this.metadata.get(cachekey);
        switch (meta) {
          case "EXPIRY":
            if (!value) {
              continue;
            }
            const expiry = parseFloat(value);
            if (staged) {
              staged.expiry = expiry;
            } else {
              this.metadata.set(cachekey, { expiry, hash: "" });
            }
            if (expiry < now) {
              expiredKeys.push(cachekey);
            }
            break;

          case "HASH":
            if (!value) {
              throw new Error("PCACHE meta key mismatch.");
            }
            if (staged) {
              staged.hash = value;
            } else {
              this.metadata.set(cachekey, { hash: value });
            }
            break;
        }
      }

      // remove expired hashes
      for (const expired of expiredKeys) {
        this.metadata.delete(expired);
      }
      AsyncStorage.multiRemove([
        ...expiredKeys.map(this.external),
        ...expiredKeys.map((k) => this.meta(k, "HASH")),
        ...expiredKeys.map((k) => this.meta(k, "EXPIRY")),
      ]);

      AsyncStorage.setItem(
        this.internal("KEYS"),
        JSON.stringify(Array.from(this.metadata.keys())),
      );

    } catch (e) {
      Dev.devOnly(() => {
        // tslint:disable-next-line: no-console
        console.warn(
          `PersistentCache: ${e} `,
          "\nWill attempt to (re)initialise AsyncStorage.",
        );
      });
      return this.initialiseAsyncStorage();
    }
  }

  private async initialiseAsyncStorage() {
    this.hashContext1 = Hashing.generateContext();
    this.hashContext2 = Hashing.generateContext();
    const keys = JSON.stringify([]);

    try {
      await AsyncStorage.multiSet([
        [ this.internal("VERSION_IDENTIFIER"), this.options.version ],
        [ this.internal("HASH_CONTEXT_1"), JSON.stringify(this.hashContext1) ],
        [ this.internal("HASH_CONTEXT_2"), JSON.stringify(this.hashContext2) ],
        [ this.internal("KEYS"), keys ],
      ]);
    } catch (e) {
      Dev.devOnly((e: Error) => {
        if (e.message !== "PCACHE_INIT") {
          // tslint:disable-next-line: no-console
          console.warn(
            "AsyncStorage failed. PersistentCache is no longer available.",
            e,
          );
        }
      }, e);
      this.available = false;
    }
  }
}

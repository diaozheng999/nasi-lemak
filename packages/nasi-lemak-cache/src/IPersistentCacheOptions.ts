/**
 * IPersistentCacheOptions.ts
 * @author Diao Zheng
 * @file Persistent Cache creation option interface
 */

export interface IPersistentCacheOptions {
  /** The prefix string to use to store metadata keys */
  metaPrefix?: string;
  /** The prefix string to use to store file keys */
  keyPrefix?: string;
  /**
   * Whether AsyncStorage should be used.
   * If this is false, will default to in-memory only caching.
   */
  useAsyncStorage?: boolean;
  /**
   * The version string to identify a valid cache.
   * For now, all versions other than the specified version string is treated
   * as invalid.
   */
  version?: string;
}

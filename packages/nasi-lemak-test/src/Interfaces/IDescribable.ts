/**
 * IDescribable.ts
 * @author Diao Zheng
 * @file A describable object that's used for debugging purposes
 */

export interface IDescribable {
  describe(linePrefix: string, abbreviate?: boolean): string;
}

/**
 * IDescribable.ts
 * @author Diao Zheng
 * @file A describable object that's used for debugging purposes
 */

import { Option } from "nasi-lemak";

export interface IDescribable {
  describe(linePrefix: string, abbreviate?: boolean): string;
  getId(): string;
  owner(): Option.Type<IDescribable>;
}

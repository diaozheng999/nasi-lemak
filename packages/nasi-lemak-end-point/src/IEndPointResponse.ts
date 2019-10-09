/**
 * IEndPointResponse.ts
 * @author Kerk Chin Wee
 * @file interface for EndPoint response
 * @ignore_tests
 */

import { Option } from "nasi";

export interface IEndPointResponse<T, S extends string | number> {
  status: {
    code: S;
    description: Option.Type<string>;
  };
  response: T;
}

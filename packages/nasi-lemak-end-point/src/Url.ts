/**
 * Url.ts
 * @author Diao Zheng
 * @file A module to build URLs from static objects
 */
import _ from "lodash";
import { Option } from "nasi";

export class Url {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public path = <T extends { [K: string]: string }>(
    path: string,
    params?: T,
    shouldEncodeValues?: boolean,
  ) => {

    const baseUrl = `${this.baseUrl}${path}`;

    if (Option.isNone(params) || _.isEmpty(params)) {
      return baseUrl;
    }

    const paramList = _.toPairs(params);

    if (shouldEncodeValues !== false) {
      const length = paramList.length;
      for (let i = 0; i < length; ++i) {
        paramList[i][1] = encodeURIComponent(paramList[i][1]);
      }
    }

    const paramString = (
      paramList
        .filter((k) => k[1])
        .map(([key, value]) => `${key}=${value}`)
        .join("&")
    );

    if (paramString) {
      return `${baseUrl}?${paramString}`;
    } else {
      return baseUrl;
    }
  }
}

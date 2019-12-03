/**
 * Utils.ts
 * @author Diao Zheng
 * @file Matcher common utilities (that's not provided by jest-matcher-utils)
 */

// @barrel export all

export function not(
  isNot: boolean,
  colour: (...args: string[]) => string,
): string {
  if (isNot) {
    return colour("not ");
  }
  return "";
}

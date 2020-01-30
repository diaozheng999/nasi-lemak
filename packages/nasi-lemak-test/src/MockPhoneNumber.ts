/**
 * MockPhoneNumber.ts
 * @author Diao Zheng
 * @file Phone number generation
 */

// @barrel export all

import { Option } from "nasi-lemak";

export interface IMockPhoneNumberSpecifications {
  prefixList: string[];
  numberOfDigits: number;
  format?: (unformatted: string) => string;
}

const a = 1073740463;
const b = 1073737877;
const c = 1073739059;

const MAX_DIGIT_PER_ITERATION = 9;

const digitMask = [
  /* 0 */ 1,
  /* 1 */ 10,
  /* 2 */ 100,
  /* 3 */ 1000,
  /* 4 */ 10000,
  /* 5 */ 100000,
  /* 6 */ 1000000,
  /* 7 */ 10000000,
  /* 8 */ 100000000,
  /* 9 */ 1000000000,
];

function generateDigit(
  seed: number,
  digits: number,
  offset: number = 0,
): string {
  if (digits <= MAX_DIGIT_PER_ITERATION) {
    const mask = digitMask[digits];
    return Math.abs(
      ((a + (seed * b) + (offset * c)) % mask) + mask).toString(10).slice(1);
  } else {
    return generateDigit(seed, digits - MAX_DIGIT_PER_ITERATION, offset + 1);
  }
}

/**
 * Generate a "believable" phone number based on an auto-increasing sequence.
 * The sequence goes as follows:
 * - generate(0) = 83740463
 * - generate(1) = 97478340
 * - generate(2) = 81216217
 * - generate(3) = 94954094
 * - generate(4) = 88691971
 * - generate(5) = 92429848
 * - generate(6) = 86167725
 * - generate(7) = 99905602
 * - generate(8) = 83643479
 * - generate(9) = 97381356
 *
 * This is similar to the "pseudo-encrypt" algorithm used to store unique
 * primary keys, and is guaranteed to be the same sequence.
 *
 * The first number (8/9) depends on the parity of `k`. The rest is a pseudo-
 * random sequence.
 *
 * @param seed a auto-increasing number
 * @returns a 8-character string that's a believable phone number.
 */
export function generate(
  seed: number,
  spec: IMockPhoneNumberSpecifications = SG,
) {
  const prefix = spec.prefixList[seed % spec.prefixList.length];
  const phoneNumber = prefix + generateDigit(seed, spec.numberOfDigits);
  return Option.callIf(spec.format, phoneNumber);
}

export function format(strings: TemplateStringsArray, ...counts: number[]) {
  return (phoneNumber: string) => {
    let response = strings[0];
    let start = 0;
    for (let i = 0; i < counts.length; ++i) {
      const end = start + counts[i];
      response += phoneNumber.slice(start, end) + strings[i + 1];
      start = end;
    }
    return response;
  };
}

export function unformatted(
  spec: IMockPhoneNumberSpecifications,
): IMockPhoneNumberSpecifications {
  // tslint:disable-next-line: no-shadowed-variable
  const { format, ...others } = spec;
  return others;
}

export const SG: IMockPhoneNumberSpecifications = {
  format: format`${4} ${4}`,
  numberOfDigits: 7,
  prefixList: ["8", "9"],
};

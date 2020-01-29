/**
 * MockPhoneNumber.test.ts
 * @author Diao Zheng
 * @file snapshot to ensure that phone number generated is identical.
 */

import { generate, SG, unformatted } from "../MockPhoneNumber";

test("phone number generator", () => {

  const numbers = [];

  const spec = unformatted(SG);

  for (let i = 0; i < 100; ++i) {
    expect(generate(i, spec)).toBe(generate(i, spec));
    expect(generate(i, spec)).toHaveLength(8);
    numbers.push(generate(i, spec));
  }
  expect(numbers).toMatchSnapshot();
});

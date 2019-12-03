/**
 * Duration.test.ts
 * @author Diao Zheng
 * @file Duration tests...
 */

import { Attach } from "../../Matchers";
import * as Duration from "../Duration";

Attach();

describe("matchers", () => {
  test("immediate", () => {
    expect(Duration.IMMEDIATE).toBeImmediate();
  });

  test("composite immediate", () => {
    expect({
      [Duration.IMMEDIATE]: true,
      timer: 5,
    }).toBeImmediate();
  });
});

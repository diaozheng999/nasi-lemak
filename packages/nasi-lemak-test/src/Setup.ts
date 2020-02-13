
/**
 * Setup.ts
 * @author Diao Zheng
 * @file Setting up Jest for the entire testing library
 */

// @barrel ignore

import { Attach } from "./Matchers";
import { MockNasiLemakImpl, MockReact } from "./Modules";

jest.mock("react", MockReact);
jest.mock("nasi-lemak-implementation", MockNasiLemakImpl);

Attach();

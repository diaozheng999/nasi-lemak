
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    terser(),
  ],
  external: [
    "asap/raw",
    "lodash",
    "nasi",
    "react",
    "tslib",
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};

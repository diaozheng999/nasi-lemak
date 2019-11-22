
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    terser(),
  ],
  external: [
    "@m1/base",
    "asap/raw",
    "react",
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};

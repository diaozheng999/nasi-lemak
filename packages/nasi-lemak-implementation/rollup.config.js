
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    terser(),
  ],
  external: [
    "nasi",
    "asap/raw",
    "react",
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};

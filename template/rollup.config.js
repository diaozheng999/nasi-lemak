import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    resolve(),
    terser(),
  ],
  external: [
    "lodash",
    "nasi",
    "nasi-lemak",
    "react",
    "react-native",
    "rxjs",
    "tslib"
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};

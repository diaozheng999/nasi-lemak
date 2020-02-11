import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    resolve(),
    terser(),
  ],
  external: [
    "react",
    "react-native",
    "nasi",
    "nasi-lemak",
    "rxjs",
    "tslib"
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};

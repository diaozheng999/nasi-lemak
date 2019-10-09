
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    terser(),
  ],
  external: [
    "asap/raw",
    "nasi",
    "nasi-lemak-end-point",
    "nasi-lemak-implementation",
    "nasi-lemak-react-types",
    "react",
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};

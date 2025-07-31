import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/my-lib.cjs.js",
      format: "cjs",
      exports: "named"
    },
    {
      file: "dist/my-lib.esm.js",
      format: "esm", 
    },
    {
      file: "dist/my-lib.umd.js",
      format: "umd",
      name: "MyLib",
    },
  ],
  plugins: [resolve(), commonjs(), terser()],
};

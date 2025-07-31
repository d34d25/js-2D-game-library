import terser from '@rollup/plugin-terser';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./exports.js",
  output: [
    {
      file: "dist/my-lib.cjs.js",
      format: "cjs", // CommonJS for Node.js
      exports: "named"
    },
    {
      file: "dist/my-lib.esm.js",
      format: "esm", // ESModules
    },
    {
      file: "dist/my-lib.umd.js",
      format: "umd", // UMD for browsers
      name: "renderLib", // Global variable name in browsers
    },
  ],
  plugins: [resolve(), commonjs(), terser()],
};

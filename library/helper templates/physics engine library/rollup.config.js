import { terser } from 'rollup-plugin-terser';

export default {
  input: 'exports.js',
  output: [
    {
      file: 'dist/physengine.js',
      format: 'umd',
      name: '2dPhysicsEngine',
    },
    {
      file: 'dist/physengine.js',
      format: 'esm',
    }
  ],
  plugins: [terser()]
};

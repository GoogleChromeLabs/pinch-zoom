import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";

const esm = {
  plugins: [
    typescript({ useTsconfigDeclarationDir: false }),
    postcss()
  ],
  external: ['pointer-tracker'],
  input: 'lib/index.ts',
  output: {
    file: 'dist/pinch-zoom.mjs',
    format: 'esm'
  },
};

const iffe = {
  plugins: [
    resolve()
  ],
  input: 'dist/pinch-zoom.mjs',
  output: {
    file: 'dist/pinch-zoom.js',
    format: 'iife',
    name: 'PinchZoom'
  },
};

const iffeMin = {
  input: 'dist/pinch-zoom.js',
  plugins: [
    terser({
      compress: { ecma: 6 },
    })
  ],
  output: {
    file: 'dist/pinch-zoom-min.js',
    format: 'iife'
  },
};

export default [esm, iffe, iffeMin];

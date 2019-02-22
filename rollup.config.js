import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";
import { dependencies } from './package.json';

const mjs = {
  plugins: [
    typescript({ useTsconfigDeclarationDir: false }),
    postcss()
  ],
  external: Object.keys(dependencies),
  input: 'lib/index.ts',
  output: {
    file: 'dist/pinch-zoom.mjs',
    format: 'esm'
  },
};

const esm = {
  plugins: [
    typescript({ useTsconfigDeclarationDir: false }),
    postcss()
  ],
  external: Object.keys(dependencies),
  input: 'lib/index.ts',
  output: {
    file: 'dist/pinch-zoom.es.js',
    format: 'esm'
  },
};

const cjs = {
  plugins: [
    typescript({ useTsconfigDeclarationDir: false }),
    postcss()
  ],
  external: Object.keys(dependencies),
  input: 'lib/index.ts',
  output: {
    file: 'dist/pinch-zoom.cjs.js',
    format: 'cjs'
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

export default [mjs, esm, cjs, iffe, iffeMin];

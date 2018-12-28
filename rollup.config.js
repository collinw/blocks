import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    name: 'main',
    file: 'build/bundle.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs()
  ]
};
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: 'build/src/index.js',
	output: {
    name: 'main',
		file: 'build/bundle.js',
		format: 'iife',
		sourcemap: true
	},
	plugins: [
		resolve(),  // tells Rollup how to find date-fns in node_modules
		commonjs()  // converts date-fns to ES modules
	]
};
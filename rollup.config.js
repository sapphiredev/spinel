import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { resolve as resolveDir } from 'path';
import cleaner from 'rollup-plugin-cleaner';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/index.ts',
	output: {
		file: './dist/index.js',
		format: 'umd',
		sourcemap: false
	},
	plugins: [
		cleaner({
			targets: ['./dist/']
		}),
		resolve(),
		commonjs(),
		typescript({ tsconfig: resolveDir(process.cwd(), 'src', 'tsconfig.json') }),
		terser({
			ecma: 2018,
			// This will ensure that whenever Rollup is in watch (dev) mode, console logs will not be removed
			compress: { drop_console: !Reflect.has(process.env, 'ROLLUP_WATCH') },
			format: { comments: false }
		})
	]
};

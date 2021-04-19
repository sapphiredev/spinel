import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import resolve from '@rollup/plugin-node-resolve';
import { resolve as resolveDir } from 'path';
import cleaner from 'rollup-plugin-cleaner';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import dotenv from 'dotenv';

dotenv.config({ debug: process.env.NODE_ENV !== 'production' });

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
		injectProcessEnv({
			PUBLIC_KEY: process.env.PUBLIC_KEY
		}),
		typescript({ tsconfig: resolveDir(process.cwd(), 'src', 'tsconfig.json') }),
		terser({
			ecma: 2020,
			// This will ensure that whenever Rollup is in watch (dev) mode, console logs will not be removed
			compress: { drop_console: !Reflect.has(process.env, 'ROLLUP_WATCH') },
			format: { comments: false }
		})
	]
};

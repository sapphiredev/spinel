import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	resolve: {
		alias: [
			{ find: '#utils', replacement: resolve('src/lib/util') },
			{ find: '#types', replacement: resolve('src/lib/types') },
			{ find: '#constants', replacement: resolve('src/lib/constants') },
			{ find: '#lib', replacement: resolve('src/lib') }
		]
	},
	test: {
		globals: true,
		coverage: {
			enabled: true,
			reporter: ['text', 'lcov']
		}
	}
});

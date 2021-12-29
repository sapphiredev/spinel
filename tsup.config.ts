import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	clean: true,
	dts: false,
	entry: ['src/**/*.ts', '!src/**/*.d.ts'],
	format: ['esm'],
	minify: false,
	watch: options.watch,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'esnext',
	tsconfig: 'src/tsconfig.json',
	bundle: false,
	shims: false,
	keepNames: true,
	splitting: false
}));

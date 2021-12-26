import { globbySync } from 'globby';
import { defineConfig } from 'tsup';

const tsFiles = globbySync([
	'src/**/*.ts', //
	'!src/**/*.d.ts'
]);

export default defineConfig((options) => ({
	clean: true,
	dts: false,
	entryPoints: tsFiles,
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

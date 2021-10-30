import type { Config } from '@jest/types';

// eslint-disable-next-line @typescript-eslint/require-await
export default async (): Promise<Config.InitialOptions> => ({
	displayName: 'unit test',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/tests/**/*.test.ts'],
	setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
	transform: {
		'^.+\\.tsx?$': 'esbuild-jest'
	},
	moduleNameMapper: {
		'^#utils/(.*)$': '<rootDir>/src/lib/util/$1',
		'^#env/(.*)$': '<rootDir>/src/lib/env/$1',
		'^#types/(.*)$': '<rootDir>/src/lib/types/$1',
		'^#constants/(.*)$': '<rootDir>/src/lib/constants/$1',
		'^#api/(.*)$': '<rootDir>/src/lib/api/$1',
		'^#lib/(.*)$': '<rootDir>/src/lib/$1',
		'^#commands/(.*)$': '<rootDir>/src/commands/$1',
		'^#select-menus/(.*)$': '<rootDir>/src/select-menus/$1',
		'^#root/(.*)$': '<rootDir>/src/$1'
	}
});

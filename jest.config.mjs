/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
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
		'^#types/(.*)$': '<rootDir>/src/lib/types/$1',
		'^#constants/(.*)$': '<rootDir>/src/lib/constants/$1',
		'^#env/(.*)$': '<rootDir>/src/lib/env/$1',
		'^#lib/(.*)$': '<rootDir>/src/lib/$1'
	}
};

export default config;

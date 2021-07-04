export const ApplicationId = process.env.APPLICATION_ID;
export const ApplicationIdBuffer = Buffer.from(ApplicationId, 'hex');

export function cast<T>(value: unknown): T {
	return value as T;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			APPLICATION_ID: string;
		}
	}
}

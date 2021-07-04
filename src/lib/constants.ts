export const ApplicationId = process.env.APPLICATION_ID;
export const PublicKeyBuffer = Buffer.from(process.env.PUBLIC_KEY, 'hex');

export function cast<T>(value: unknown): T {
	return value as T;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			APPLICATION_ID: string;
			APPLICATION_SECRET: string;
			PUBLIC_KEY: string;
		}
	}
}

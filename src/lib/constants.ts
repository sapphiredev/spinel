export const PublicKey = process.env.PUBLIC_KEY;
export const PublicKeyBuffer = Buffer.from(PublicKey, 'hex');

export function cast<T>(value: unknown): T {
	return value as T;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			PUBLIC_KEY: string;
		}
	}
}

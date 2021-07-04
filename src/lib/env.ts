export const DiscordApplicationId = process.env.DISCORD_APPLICATION_ID;
export const DiscordPublicKeyBuffer = Buffer.from(process.env.PUBLIC_KEY, 'hex');
export const AlgoliaApplicationId = process.env.ALGOLIA_APPLICATION_ID;
export const AlgoliaApplicationKey = process.env.ALGOLIA_APPLICATION_KEY;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_APPLICATION_ID: string;
			DISCORD_APPLICATION_SECRET: string;
			PUBLIC_KEY: string;
			ALGOLIA_APPLICATION_ID: string;
			ALGOLIA_APPLICATION_KEY: string;
		}
	}
}

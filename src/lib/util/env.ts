export const DiscordApplicationId = process.env.DISCORD_APPLICATION_ID;
export const DiscordPublicKeyBuffer = Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex');
export const AlgoliaApplicationId = process.env.ALGOLIA_APPLICATION_ID;
export const AlgoliaApplicationKey = process.env.ALGOLIA_APPLICATION_KEY;
export const GitHubBearerToken = process.env.GH_API_KEY;
export const DiscordWebhookDbMessage = `${process.env.DISCORD_WEBHOOK_DB_URL}/messages/${process.env.DISCORD_WEBHOOK_DB_MESSAGE_ID}`;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			ALGOLIA_APPLICATION_ID: string;
			ALGOLIA_APPLICATION_KEY: string;
			DISCORD_APPLICATION_ID: string;
			DISCORD_APPLICATION_SECRET: string;
			DISCORD_PUBLIC_KEY: string;
			GH_API_KEY: string;
			DISCORD_WEBHOOK_DB_URL: string;
			DISCORD_WEBHOOK_DB_MESSAGE_ID: string;
		}
	}
}

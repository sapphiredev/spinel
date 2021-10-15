export const DiscordApplicationId = process.env.DISCORD_APPLICATION_ID;
export const DiscordPublicKeyBuffer = Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex');
export const DjsGuideAlgoliaApplicationId = process.env.DJS_GUIDE_ALGOLIA_APPLICATION_ID;
export const DjsGuideAlgoliaApplicationKey = process.env.DJS_GUIDE_ALGOLIA_APPLICATION_KEY;
export const DiscordDeveloperDocsAlgoliaApplicationId = process.env.DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID;
export const DiscordDeveloperDocsAlgoliaApplicationKey = process.env.DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_KEY;
export const GitHubBearerToken = process.env.GH_API_KEY;
export const DiscordWebhookDbMessage = `${process.env.DISCORD_WEBHOOK_DB_URL}/messages/${process.env.DISCORD_WEBHOOK_DB_MESSAGE_ID}`;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_APPLICATION_ID: string;
			DISCORD_APPLICATION_SECRET: string;
			DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID: string;
			DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_KEY: string;
			DISCORD_PUBLIC_KEY: string;
			DISCORD_WEBHOOK_DB_MESSAGE_ID: string;
			DISCORD_WEBHOOK_DB_URL: string;
			DJS_GUIDE_ALGOLIA_APPLICATION_ID: string;
			DJS_GUIDE_ALGOLIA_APPLICATION_KEY: string;
			GH_API_KEY: string;
		}
	}
}

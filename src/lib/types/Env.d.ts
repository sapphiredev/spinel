import type { ArrayString, BooleanString, IntegerString } from '@skyra/env-utilities';

export default undefined;

declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_CLIENT_ID: string;
		DISCORD_APPLICATION_SECRET: string;
		DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID: string;
		DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_KEY: string;
		DISCORD_PUBLIC_KEY: string;
		COMMAND_GUILD_IDS: ArrayString;
		DJS_GUIDE_ALGOLIA_APPLICATION_ID: string;
		DJS_GUIDE_ALGOLIA_APPLICATION_KEY: string;
		GH_API_KEY: string;
		NPM_ALGOLIA_APPLICATION_ID: string;
		NPM_ALOGLIA_APPLICATION_KEY: string;
		SAPPHIRE_DOCS_ALOGLIA_APPLICATION_ID: string;
		SAPPHIRE_DOCS_ALOGLIA_APPLICATION_KEY: string;
		REDIS_PORT: IntegerString;
		REDIS_PASSWORD: string;
		REDIS_HOST: string;
		REDIS_CACHE_DB: IntegerString;
	}
}

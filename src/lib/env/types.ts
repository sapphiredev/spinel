export type BooleanString = 'true' | 'false';
export type IntegerString = `${bigint}`;

export type SapphireSlashiesEnvAny = keyof SapphireSlashiesEnv;
export type SapphireSlashiesEnvString = {
	[K in SapphireSlashiesEnvAny]: SapphireSlashiesEnv[K] extends BooleanString | IntegerString ? never : K;
}[SapphireSlashiesEnvAny];
export type SapphireSlashiesEnvBoolean = {
	[K in SapphireSlashiesEnvAny]: SapphireSlashiesEnv[K] extends BooleanString ? K : never;
}[SapphireSlashiesEnvAny];
export type SapphireSlashiesEnvInteger = {
	[K in SapphireSlashiesEnvAny]: SapphireSlashiesEnv[K] extends IntegerString ? K : never;
}[SapphireSlashiesEnvAny];

export interface SapphireSlashiesEnv {
	DISCORD_CLIENT_ID: string;
	DISCORD_APPLICATION_SECRET: string;
	DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID: string;
	DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_KEY: string;
	DISCORD_PUBLIC_KEY: string;
	COMMAND_GUILD_IDS: string;
	DJS_GUIDE_ALGOLIA_APPLICATION_ID: string;
	DJS_GUIDE_ALGOLIA_APPLICATION_KEY: string;
	DOTENV_DEBUG_ENABLED: BooleanString;
	GH_API_KEY: string;
	NODE_ENV: 'test' | 'development' | 'production';
	SAPPHIRE_DOCS_ALOGLIA_APPLICATION_ID: string;
	SAPPHIRE_DOCS_ALOGLIA_APPLICATION_KEY: string;
	REDIS_PORT: IntegerString;
	REDIS_PASSWORD: string;
	REDIS_HOST: string;
	REDIS_CACHE_DB: IntegerString;
}

export type BooleanString = 'true' | 'false';
export type IntegerString = `${bigint}`;

export type SapphireSlashiesEnvAny = keyof SapphireSlashiesEnv;
export type SapphireSlashiesEnvString = { [K in SapphireSlashiesEnvAny]: SapphireSlashiesEnv[K] extends BooleanString | IntegerString ? never : K }[SapphireSlashiesEnvAny];
export type SapphireSlashiesEnvBoolean = { [K in SapphireSlashiesEnvAny]: SapphireSlashiesEnv[K] extends BooleanString ? K : never }[SapphireSlashiesEnvAny];
export type SapphireSlashiesEnvInteger = { [K in SapphireSlashiesEnvAny]: SapphireSlashiesEnv[K] extends IntegerString ? K : never }[SapphireSlashiesEnvAny];

export interface SapphireSlashiesEnv {
	DISCORD_APPLICATION_ID: string;
	DISCORD_APPLICATION_SECRET: string;
	DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID: string;
	DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_KEY: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_WEBHOOK_DB_MESSAGE_ID: string;
	DISCORD_WEBHOOK_DB_URL: string;
	DJS_GUIDE_ALGOLIA_APPLICATION_ID: string;
	DJS_GUIDE_ALGOLIA_APPLICATION_KEY: string;
	DOTENV_DEBUG_ENABLED: BooleanString;
	GH_API_KEY: string;
	MODERATOR_ID: string;
	NODE_ENV: 'test' | 'development' | 'production';
}

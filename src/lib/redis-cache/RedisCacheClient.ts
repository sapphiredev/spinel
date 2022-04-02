import { envParseInteger, envParseString } from '#env/utils';
import type { AlgoliaHit } from '#types/Algolia';
import { fromAsync, isErr } from '@sapphire/result';
import { isNullish } from '@sapphire/utilities';
import type { TransformedArguments } from '@skyra/http-framework';
import Redis from 'ioredis';

export const enum RedisKeys {
	DiscordDocs = 'discord-docs',
	DiscordJsGuide = 'discordjs-guide'
}

export class RedisCacheClient extends Redis {
	public constructor() {
		super({
			port: envParseInteger('REDIS_PORT'),
			password: envParseString('REDIS_PASSWORD'),
			host: envParseString('REDIS_HOST'),
			db: envParseInteger('REDIS_CACHE_DB')
		});
	}

	public async fetch<K extends RedisKeys>(key: K, query: string, nthResult: string): Promise<AlgoliaHit | null> {
		const result = await fromAsync<AlgoliaHit>(async () => {
			const raw = await this.get(`${key}:${query}:${nthResult}`);

			if (isNullish(raw)) return raw;

			return JSON.parse(raw);
		});

		if (isErr(result) || result.value === null) {
			return null;
		}

		return result.value;
	}

	public insertFor60Seconds(key: RedisKeys, query: TransformedArguments.AutocompleteFocused, nthResult: string, data: AlgoliaHit) {
		return this.setex(`${key}:${query}:${nthResult}`, 60, JSON.stringify(data));
	}
}

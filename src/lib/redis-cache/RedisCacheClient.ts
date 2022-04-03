import { envParseInteger, envParseString } from '#env/utils';
import { fromAsync, isErr } from '@sapphire/result';
import { isNullish } from '@sapphire/utilities';
import Redis from 'ioredis';

export const enum RedisKeys {
	DiscordDocs = 'discord-docs',
	DiscordJsGuide = 'discordjs-guide',
	Mdn = 'mdn',
	Node = 'node',
	Sapphire = 'sapphire'
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

	public async fetch<T>(key: RedisKeys, query: string, nthResult: string): Promise<T | null> {
		const result = await fromAsync<T>(async () => {
			const raw = await this.get(`${key}:${query}:${nthResult}`);

			if (isNullish(raw)) return raw;

			return JSON.parse(raw);
		});

		if (isErr(result) || result.value === null) {
			return null;
		}

		return result.value;
	}

	public insertFor60Seconds<T>(key: RedisKeys, query: string, nthResult: string, data: T) {
		return this.setex(`${key}:${query}:${nthResult}`, 60, JSON.stringify(data));
	}
}

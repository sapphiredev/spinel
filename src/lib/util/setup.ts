import { RedisCacheClient } from '#lib/redis-cache/RedisCacheClient';
import { loadTags } from '#utils/tags';
import { setup } from '@skyra/env-utilities';
import { container } from '@sapphire/pieces';
import { URL } from 'node:url';

process.env.NODE_ENV ??= 'development';

setup(new URL('../../../.env', import.meta.url));

await loadTags();

container.redisClient = new RedisCacheClient();

declare module '@sapphire/pieces' {
	interface Container {
		redisClient: RedisCacheClient;
	}
}

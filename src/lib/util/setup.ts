import { RedisCacheClient } from '#lib/redis-cache/RedisCacheClient';
import { loadTags } from '#utils/tags';
import { setup } from '@skyra/env-utilities';
import { URL } from 'node:url';

process.env.NODE_ENV ??= 'development';

setup(new URL('../../../.env', import.meta.url));

await loadTags();

new RedisCacheClient();

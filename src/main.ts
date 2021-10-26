import { start } from '#root/server';
import { loadTags } from '#utils/tags';
import { config } from 'dotenv-cra';
import { fileURLToPath, URL } from 'node:url';

process.env.NODE_ENV ??= 'development';

config({
	path: fileURLToPath(new URL('../.env', import.meta.url))
});

void loadTags();
void start();

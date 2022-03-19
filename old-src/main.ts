import { start } from '#root/server';
import { loadTags } from '#utils/tags';
import { config } from 'dotenv-cra';
import { fileURLToPath, URL } from 'node:url';
import { Doc } from 'discordjs-docs-parser';

process.env.NODE_ENV ??= 'development';

Doc.setGlobalOptions({
	escapeMarkdownLinks: true
});

config({
	path: fileURLToPath(new URL('../.env', import.meta.url))
});

await loadTags();
await start();

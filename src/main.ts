import '#utils/setup';
import { envParseString } from '#env/utils';
import { registerCommands } from '#utils/register-commands';
import { Client } from '@skyra/http-framework';

const client = new Client({ discordPublicKey: envParseString('DISCORD_PUBLIC_KEY') });

await client.load();

await registerCommands();

await client.listen({
	port: process.env.PORT || 3000,
	address: '0.0.0.0'
});

console.log(`client listening on 0.0.0.0:${process.env.PORT || 3000}`);

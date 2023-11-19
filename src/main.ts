import '#utils/setup';

import { registerCommands } from '#utils/register-commands';
import { isNullish } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import { Client } from '@skyra/http-framework';

const client = new Client({ discordPublicKey: envParseString('DISCORD_PUBLIC_KEY') });

await client.load();

await registerCommands();

await client.listen({
	port: isNullish(process.env.PORT) ? 3000 : Number(process.env.PORT),
	address: '0.0.0.0'
});

process.env.NODE_ENV ??= 'development';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { APIApplicationCommandInteraction, APIInteraction, InteractionResponseType, InteractionType } from 'discord-api-types/v8';
import { config } from 'dotenv-cra';
import { join } from 'path';
import { ping } from './commands/ping';
import { cast } from './lib/constants';
import { HttpCodes } from './lib/HttpCodes';
import { verifyDiscordInteraction } from './lib/verifyDiscordInteraction';

config({
	path: process.env.NODE_ENV === 'production' ? join(__dirname, '.env') : join(__dirname, '..', '.env')
});

export default (req: VercelRequest, res: VercelResponse): VercelResponse => {
	const interactionInvalid = verifyDiscordInteraction(req);
	if (interactionInvalid) {
		return res.status(interactionInvalid.statusCode).json({ message: interactionInvalid.message });
	}

	const json = cast<APIInteraction>(req.body);

	if (json.type === InteractionType.Ping) return res.json({ type: InteractionResponseType.Pong });

	const castedJson = cast<APIApplicationCommandInteraction>(json);

	switch (castedJson.data.name) {
		case 'ping':
			return res.json(ping(castedJson));
	}

	return res.status(HttpCodes.NotFound).json({ message: 'Not Found' });
};

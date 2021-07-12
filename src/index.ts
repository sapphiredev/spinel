process.env.NODE_ENV ??= 'development';

import type { Awaited } from '@sapphire/utilities';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
	APIApplicationCommandInteraction,
	APIInteraction,
	ApplicationCommandInteractionDataOptionInteger,
	ApplicationCommandInteractionDataOptionString,
	ApplicationCommandInteractionDataOptionUser,
	InteractionResponseType,
	InteractionType,
	Snowflake
} from 'discord-api-types/v8';
import { config } from 'dotenv-cra';
import { join } from 'path';
import { djsDocs } from './commands/djsDocs';
import { djsGuide } from './commands/djsGuide';
import { githubSearch } from './commands/githubApi';
import { invite } from './commands/invite';
import { mdnSearch } from './commands/mdnDocs';
import { nodeSearch } from './commands/nodeDocs';
import { ping } from './commands/ping';
import { cast } from './lib/constants';
import { HttpCodes } from './lib/HttpCodes';
import { verifyDiscordInteraction } from './lib/verifyDiscordInteraction';

config({
	path: process.env.NODE_ENV === 'production' ? join(__dirname, '.env') : join(__dirname, '..', '.env')
});

export default (req: VercelRequest, res: VercelResponse): Awaited<VercelResponse> => {
	const interactionInvalid = verifyDiscordInteraction(req);
	if (interactionInvalid) {
		return res.status(interactionInvalid.statusCode).json({ message: interactionInvalid.message });
	}

	const json = cast<APIInteraction>(req.body);

	if (json.type === InteractionType.Ping) return res.json({ type: InteractionResponseType.Pong });

	const {
		id,
		data: { options, name }
	} = cast<APIApplicationCommandInteraction>(json);

	if (options?.length) {
		const args = Object.fromEntries(
			cast<
				Array<
					| ApplicationCommandInteractionDataOptionString
					| ApplicationCommandInteractionDataOptionUser
					| ApplicationCommandInteractionDataOptionInteger
				>
			>(options).map(({ name, value }) => [name, value])
		);

		switch (name) {
			// case 'docs':
			// 	return sapphireDocs(res, args.source ?? 'framework#latest', args.query, args.target);
			// case 'guide':
			// 	return sapphireGuide(res, args.query, args.results ?? 2, args.target);
			case 'djs':
				return djsDocs({
					response: res,
					source: cast<string>(args.source ?? 'stable'),
					query: cast<string>(args.query),
					target: cast<Snowflake>(args.target)
				});
			case 'djs-guide':
				return djsGuide({
					response: res,
					query: cast<string>(args.query),
					amountOfResults: cast<number>(args.results ?? 2),
					target: cast<Snowflake>(args.target)
				});
			case 'mdn':
				return mdnSearch({
					response: res,
					query: cast<string>(args.query),
					target: cast<Snowflake>(args.target)
				});
			case 'node':
				return nodeSearch({
					response: res,
					query: cast<string>(args.query),
					version: cast<'latest-v12.x' | 'latest-v14.x' | 'latest-v16.x'>(args.version),
					target: cast<Snowflake>(args.target)
				});
			case 'github':
				return githubSearch({
					response: res,
					number: parseInt(cast<string>(args.number), 10),
					owner: cast<string>(args.owner ?? 'sapphiredev'),
					repository: cast<string>(args.repository),
					target: cast<Snowflake>(args.target)
				});
		}
	}

	switch (name) {
		case 'ping':
			return res.json(ping(id));
		case 'invite':
			return res.json(invite());
	}

	return res.status(HttpCodes.NotFound).json({ message: 'Not Found' });
};

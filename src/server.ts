import { verifyDiscordInteraction } from '#api/verifyDiscordInteraction';
import { djsDocsAutocomplete } from '#autocomplete/djs-docs-autocomplete';
import { tagsAutocomplete } from '#autocomplete/tags-autocomplete';
import { discordDeveloperDocs } from '#commands/discordDeveloperDocs';
import { djsDocs } from '#commands/djsDocs';
import { djsGuide } from '#commands/djsGuide';
import { githubSearch } from '#commands/githubApi';
import { invite } from '#commands/invite';
import { mdnSearch } from '#commands/mdnDocs';
import { nodeSearch } from '#commands/nodeDocs';
import { ping } from '#commands/ping';
import { reloadTags } from '#commands/reloadTags';
import { sapphireDocs } from '#commands/sapphireDocs';
import { searchTag } from '#commands/searchTag';
import { showTag } from '#commands/tags';
import { cast, FailPrefix } from '#constants/constants';
import { handleDjsDocsSelectMenu } from '#select-menus/djs-docs-menu';
import { handleTagSelectMenu } from '#select-menus/tag-menu';
import { errorResponse, sendJson } from '#utils/responseHelpers';
import {
	InteractionResponseType,
	InteractionType,
	type APIApplicationCommandOptionChoice,
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	type APIMessageSelectMenuInteractionData,
	type APIUser,
	type Snowflake
} from 'discord-api-types/v9';
import type { SourcesStringUnion } from 'discordjs-docs-parser';
import Fastify from 'fastify';

const fastify = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'debug' } });

fastify.post('/', async (req, res) => {
	const interactionInvalid = verifyDiscordInteraction(req);
	if (interactionInvalid) {
		return res //
			.status(interactionInvalid.statusCode)
			.send({ message: interactionInvalid.message });
	}

	try {
		const json = cast<APIInteraction>(req.body);

		if (json.type === InteractionType.Ping) return res.send({ type: InteractionResponseType.Pong });

		if (json.type === InteractionType.ApplicationCommand) {
			const {
				id,
				member,
				data: { options, name }
			} = cast<APIChatInputApplicationCommandInteraction>(json);

			if (options?.length) {
				const args = Object.fromEntries(
					cast<
						Array<
							| APIApplicationCommandOptionChoice<string>
							| APIApplicationCommandOptionChoice<number>
							| APIApplicationCommandOptionChoice<APIUser>
						>
					>(options).map(({ name, value }) => [name, value])
				);

				switch (name as RegisteredSlashiesWithOptions) {
					case 'sapphire':
						return sapphireDocs({
							response: res,
							query: cast<string>(args.query).trim(),
							amountOfResults: cast<number>(args.results ?? 2),
							target: cast<Snowflake>(args.target),
							shouldIncludeDocs: cast<boolean>(args['include-docs'] ?? true)
						});
					case 'ddocs':
						return discordDeveloperDocs({
							response: res,
							query: cast<string>(args.query).trim(),
							amountOfResults: cast<number>(args.results ?? 2),
							target: cast<Snowflake>(args.target)
						});
					case 'djs':
						return djsDocs({
							response: res,
							source: cast<SourcesStringUnion>(args.source ?? 'stable'),
							query: cast<string>(args.query).trim(),
							target: cast<Snowflake>(args.target)
						});
					case 'djs-guide':
						return djsGuide({
							response: res,
							query: cast<string>(args.query).trim(),
							amountOfResults: cast<number>(args.results ?? 2),
							target: cast<Snowflake>(args.target)
						});
					case 'mdn':
						return mdnSearch({
							response: res,
							query: cast<string>(args.query).trim(),
							target: cast<Snowflake>(args.target)
						});
					case 'node':
						return nodeSearch({
							response: res,
							query: cast<string>(args.query).trim(),
							version: cast<'latest-v12.x' | 'latest-v14.x' | 'latest-v16.x' | 'latest-v17.x'>(args.version),
							target: cast<Snowflake>(args.target)
						});
					case 'github':
						return githubSearch({
							response: res,
							number: cast<number>(args.number),
							owner: cast<string>(args.owner ?? 'sapphiredev').trim(),
							repository: cast<string>(args.repository).trim(),
							target: cast<Snowflake>(args.target)
						});
					case 'tag':
						return showTag({
							response: res,
							query: cast<string>(args.query).trim().toLowerCase(),
							target: cast<Snowflake>(args.target)
						});
					case 'tag-search':
						return searchTag({
							response: res,
							query: cast<string>(args.query).trim().toLowerCase(),
							target: cast<Snowflake>(args.target)
						});
				}
			}

			switch (name as RegisteredSlashies) {
				case 'ping':
					return res.send(ping(id));
				case 'invite':
					return res.send(invite());
				case 'reload-tags':
					return reloadTags({
						response: res,
						member
					});
			}
		}

		if (json.type === InteractionType.MessageComponent) {
			const { token } = json;
			const { custom_id: customId, values: selected } = json.data as APIMessageSelectMenuInteractionData;
			const [op, target, source] = customId.split('|');

			switch (op as SelectMenuOpCodes) {
				case 'docsearch': {
					await handleDjsDocsSelectMenu({
						response: res,
						selectedValue: selected[0],
						token,
						target,
						source: cast<SourcesStringUnion>(source)
					});
					return res.status(200);
				}
				case 'tag': {
					await handleTagSelectMenu({ response: res, selectedValue: selected[0], token, target });
					return res.status(200);
				}
			}
		}

		if (json.type === InteractionType.ApplicationCommandAutocomplete) {
			let {
				data: { options, name }
			} = cast<APIChatInputApplicationCommandInteraction>(json);

			options ??= [];

			const args = Object.fromEntries(cast<Array<APIApplicationCommandOptionChoice<string>>>(options).map(({ name, value }) => [name, value]));

			switch (name as RegisteredSlashiesWithAutocomplete) {
				case 'djs':
					return djsDocsAutocomplete({
						response: res,
						source: cast<SourcesStringUnion>(args.source ?? 'stable'),
						query: cast<string>(args.query).trim()
					});
				case 'tag':
					return tagsAutocomplete({
						response: res,
						query: cast<string>(args.query).trim()
					});
			}
		}

		return sendJson(
			res,
			errorResponse({
				content: `${FailPrefix} how did you get here? What magic data are you sending that your interaction type is not being recognised?`
			})
		);
	} catch (error) {
		return sendJson(res, errorResponse({ content: `${FailPrefix} it looks like something went wrong here, please try again later!` }));
	}
});

export async function start() {
	try {
		await fastify.listen(process.env.PORT || 3000, '0.0.0.0');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

type RegisteredSlashiesWithOptions = 'djs-guide' | 'djs' | 'mdn' | 'node' | 'github' | 'sapphire' | 'tag' | 'tag-search' | 'ddocs';
type RegisteredSlashiesWithAutocomplete = 'djs' | 'tag';
type RegisteredSlashies = 'ping' | 'invite' | 'reload-tags';
type SelectMenuOpCodes = 'tag' | 'docsearch';

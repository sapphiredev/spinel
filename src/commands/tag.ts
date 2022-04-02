import { SapphireGemId } from '#constants/emotes';
import { errorResponse } from '#utils/response-utils';
import { findSimilar, findTag, mapTagSimilarityEntry, tagCache } from '#utils/tags';
import { getGuildIds } from '#utils/utils';
import { inlineCode } from '@discordjs/builders';
import { Command, RegisterCommand, RestrictGuildIds, type AutocompleteInteractionArguments, type TransformedArguments } from '@skyra/http-framework';
import { MessageFlags, type APIApplicationCommandOptionChoice, type APIInteractionResponse } from 'discord-api-types/v10';

@RegisterCommand((builder) =>
	builder //
		.setName('tag')
		.setDescription('Send a tag by name or by alias')
		.addStringOption((builder) =>
			builder //
				.setName('query')
				.setDescription('The name or alias of the tag to send')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addUserOption((builder) =>
			builder //
				.setName('target')
				.setDescription('Who should I ping that should look at these results?')
		)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	public override autocompleteRun(_: never, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'query') {
			return this.autocompleteNoResults();
		}

		const query = args.query.trim().toLowerCase();

		const results: APIApplicationCommandOptionChoice[] = [];

		if (query.length) {
			const keywordMatches: APIApplicationCommandOptionChoice[] = [];
			const contentMatches: APIApplicationCommandOptionChoice[] = [];
			const exactKeywords: APIApplicationCommandOptionChoice[] = [];

			for (const [key, tag] of tagCache.entries()) {
				const exactKeyword = tag.keywords.find((s) => s.toLowerCase() === query.toLowerCase());
				const includesKeyword = tag.keywords.find((s) => s.toLowerCase().includes(query.toLowerCase()));
				const isContentMatch = tag.content.toLowerCase().includes(query);

				if (exactKeyword) {
					exactKeywords.push({
						name: `⭐ ${key}`,
						value: key
					});
				} else if (includesKeyword) {
					keywordMatches.push({
						name: `🏷️ ${key}`,
						value: key
					});
				} else if (isContentMatch) {
					contentMatches.push({
						name: `📄 ${key}`,
						value: key
					});
				}
			}

			results.push(...exactKeywords, ...keywordMatches, ...contentMatches);
		} else {
			results.push(
				...tagCache
					.filter((t) => t.hoisted)
					.map((_, key) => {
						return {
							name: `📌 ${key}`,
							value: key
						};
					})
			);
		}

		return this.autocomplete({
			choices: results.slice(0, 19)
		});
	}

	public override chatInputRun(_: never, { query, target }: Args): APIInteractionResponse {
		query = query.trim().toLowerCase();

		const content = findTag(query, target?.user.id);

		if (content) {
			return this.message({
				content,
				allowed_mentions: {
					users: target?.user.id ? [target.user.id] : []
				}
			});
		}

		const similar = findSimilar(query);

		if (similar.length) {
			return this.selectMenuMessage(`tag.${target?.user.id ?? ''}`, similar.map(mapTagSimilarityEntry), {
				flags: MessageFlags.Ephemeral,
				content: `${SapphireGemId} Could not find a tag with name or alias ${inlineCode(query)}. Select a similar tag to send instead:`
			});
		}

		return this.message(
			errorResponse({
				content: `Could not find a tag with name or alias similar to ${inlineCode(query)}`
			})
		);
	}
}

interface Args {
	query: string;
	target?: TransformedArguments.User;
}

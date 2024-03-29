import { SapphireGemId } from '#constants/emotes';
import { errorResponse } from '#utils/response-utils';
import { findSimilarTag, findTag, mapTagSimilarityEntry, tagCache } from '#utils/tags';
import { buildSelectMenuResponse, getGuildIds } from '#utils/utils';
import { inlineCode } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds, type AutocompleteInteractionArguments, type TransformedArguments } from '@skyra/http-framework';
import { MessageFlags, type APIApplicationCommandOptionChoice } from 'discord-api-types/v10';

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
	public override autocompleteRun(interaction: Command.AutocompleteInteraction, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'query' || isNullishOrEmpty(args.query)) {
			return interaction.replyEmpty();
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

		return interaction.reply({
			choices: results.slice(0, 19)
		});
	}

	public override chatInputRun(interaction: Command.Interaction, { query, target }: Args) {
		query = query.trim().toLowerCase();

		const content = findTag(query, target?.user.id);

		if (content) {
			return interaction.reply({
				content,
				allowed_mentions: {
					users: target?.user.id ? [target.user.id] : []
				}
			});
		}

		const similar = findSimilarTag(query);

		if (similar.length) {
			return interaction.reply(
				buildSelectMenuResponse(`tag.${target?.user.id ?? ''}`, similar.map(mapTagSimilarityEntry), {
					flags: MessageFlags.Ephemeral,
					content: `${SapphireGemId} Could not find a tag with name or alias ${inlineCode(query)}. Select a similar tag to send instead:`
				})
			);
		}

		return interaction.reply(
			errorResponse({
				content: `no tags were found with a name or alias similar to ${inlineCode(query)}`
			})
		);
	}
}

interface Args {
	query: string;
	target?: TransformedArguments.User;
}

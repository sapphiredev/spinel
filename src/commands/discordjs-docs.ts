import { DjsDocsDevIcon, DjsDocsStableIcon } from '#constants/emotes';
import { buildSelectOption, fetchDocResult, fetchDocs } from '#utils/discordjs-docs';
import { errorResponse } from '#utils/response-utils';
import { getGuildIds } from '#utils/utils';
import { inlineCode, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { cast } from '@sapphire/utilities';
import {
	Command,
	InteractionArguments,
	RegisterCommand,
	RegisterSubCommand,
	RestrictGuildIds,
	type AutocompleteInteractionArguments,
	type TransformedArguments
} from '@skyra/http-framework';
import {
	MessageFlags,
	type APIApplicationCommandOptionChoice,
	type APIInteractionResponseCallbackData,
	type APISelectMenuOption
} from 'discord-api-types/v10';
import type { DocElement, SourcesStringUnion } from 'discordjs-docs-parser';

@RegisterCommand((builder) => builder.setName('discordjs-docs').setDescription('Search discord.js documentation'))
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	public override async autocompleteRun(_: never, args: AutocompleteInteractionArguments<Args>) {
		if (!args.subCommand || args.focused !== 'query') {
			return this.autocompleteNoResults();
		}

		const query = args.query.trim().toLowerCase();
		const doc = await fetchDocs(args.subCommand as SourcesStringUnion);

		const results: APIApplicationCommandOptionChoice[] = [];

		if (query.length) {
			const element = doc.get(...query.split(/\.|#/));
			if (element) {
				results.push({ name: element.formattedName, value: element.formattedName });
			} else {
				const searchResult = doc.search(query) ?? [];
				for (const r of searchResult) {
					results.push({
						name: r.formattedName,
						value: r.formattedName
					});
				}
			}
		} else {
			const searchResult = doc.search('Client') ?? [];
			for (const r of searchResult) {
				results.push({
					name: r.formattedName,
					value: r.formattedName
				});
			}
		}

		return this.autocomplete({
			choices: results.slice(0, 19)
		});
	}

	@RegisterSubCommand(buildSubcommandBuilders('stable', 'Search the discord.js documentation (stable version)'))
	@RegisterSubCommand(buildSubcommandBuilders('main', 'Search the discord.js documentation (main branch)'))
	@RegisterSubCommand(buildSubcommandBuilders('collection', 'Search the @discordjs/collection documentation'))
	@RegisterSubCommand(buildSubcommandBuilders('builders', 'Search the @discordjs/builders documentation'))
	@RegisterSubCommand(buildSubcommandBuilders('voice', 'Search the @discordjs/voice documentation'))
	@RegisterSubCommand(buildSubcommandBuilders('rest', 'Search the @discordjs/rest documentation'))
	@RegisterSubCommand(buildSubcommandBuilders('rpc', 'Search the discord-rpc documentation'))
	protected async sharedRun(_: never, { subCommand, query, target }: InteractionArguments<Args>): Promise<Command.Response> {
		const source = cast<SourcesStringUnion>(subCommand);

		const doc = await fetchDocs(source);

		const singleResult = fetchDocResult({ source, doc, query, target: target?.user.id });

		if (singleResult) {
			return this.message({
				content: singleResult,
				allowed_mentions: {
					users: target?.user.id ? [target?.user.id] : []
				}
			});
		}

		const results = doc.search(query);

		if (results?.length) {
			const selectMenuData = this.buildSelectMenuResponse(query, source, results, target);
			return this.selectMenuMessage(selectMenuData.customId, selectMenuData.selectMenuOptions, selectMenuData.data);
		}

		return this.message(
			errorResponse({
				content: `no results were found for ${inlineCode(query)}`
			})
		);
	}

	private buildSelectMenuResponse(
		query: string,
		source: SourcesStringUnion,
		results: DocElement[],
		target: TransformedArguments.User | undefined
	): BuildSelectMenuResponseReturnType {
		return {
			customId: `discordjs-docs.${target?.user.id ?? ''}.${source}`,
			selectMenuOptions: results.map((r) => buildSelectOption(r, source === 'main')),
			data: {
				flags: MessageFlags.Ephemeral,
				content: `${
					source === 'main' ? DjsDocsDevIcon : DjsDocsStableIcon
				} Could not find anything in the DiscordJS documentation for ${inlineCode(query)}. Select a similar search result to send instead:`
			}
		};
	}
}

function buildSubcommandBuilders(name: SourcesStringUnion, description: string) {
	return new SlashCommandSubcommandBuilder() //
		.setName(name)
		.setDescription(description)
		.addStringOption((builder) =>
			builder //
				.setName('query')
				.setDescription('The phrase to search for')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addUserOption((builder) =>
			builder //
				.setName('target')
				.setDescription('Who should I ping that should look at these results?')
		);
}

interface Args {
	query: string;
	target?: TransformedArguments.User;
}

interface BuildSelectMenuResponseReturnType {
	customId: string;
	selectMenuOptions: APISelectMenuOption[];
	data: APIInteractionResponseCallbackData;
}

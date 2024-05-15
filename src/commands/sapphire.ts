import { FetchUserAgent } from '#constants/constants';
import { SapphireGemId } from '#constants/emotes';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { AlgoliaSearchResult, DocsearchHit } from '#types/Algolia.js';
import { buildHierarchicalName, buildResponseContent, replaceDotHtml } from '#utils/algolia-utils';
import { errorResponse } from '#utils/response-utils';
import { getGuildIds } from '#utils/utils';
import { SlashCommandSubcommandBuilder, hideLinkEmbed, hyperlink, inlineCode, unorderedList } from '@discordjs/builders';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import { cast, cutText, isNullishOrEmpty } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import {
	Command,
	RegisterCommand,
	RegisterSubcommand,
	RestrictGuildIds,
	type AutocompleteInteractionArguments,
	type InteractionArguments,
	type TransformedArguments
} from '@skyra/http-framework';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import he from 'he';
import { URLSearchParams } from 'node:url';

@RegisterCommand((builder) => builder.setName('sapphire').setDescription('Search Sapphire guide and documentation'))
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	#algoliaUrl = new URL(`https://${envParseString('SAPPHIRE_DOCS_ALOGLIA_APPLICATION_ID')}-dsn.algolia.net/1/indexes/sapphirejs/query`);
	#docsResponseHeaderText = `${hyperlink('Sapphire', hideLinkEmbed('https://www.sapphirejs.dev'))} docs results:`;
	#guideResponseHeaderText = `${hyperlink('Sapphire', hideLinkEmbed('https://www.sapphirejs.dev'))} guide results:`;

	public override async autocompleteRun(interaction: Command.AutocompleteInteraction, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'query' || isNullishOrEmpty(args.query) || isNullishOrEmpty(args.subCommand)) {
			return interaction.replyEmpty();
		}

		const algoliaResponse = await this.fetchApi(cast<'docs' | 'guide'>(args.subCommand), args.query);

		const redisInsertPromises: Promise<'OK'>[] = [];
		const results: APIApplicationCommandOptionChoice[] = [];

		const seenUrls = new Set();

		for (const [index, hit] of algoliaResponse.hits.entries()) {
			hit.url = replaceWww(replaceDotHtml(hit.url));

			// If the URL is already in the matched hits, skip it so it doesn't show twice
			if (seenUrls.has(hit.url)) {
				continue;
			}

			seenUrls.add(hit.url);

			const hierarchicalName = buildHierarchicalName(hit.hierarchy);

			if (hierarchicalName) {
				redisInsertPromises.push(
					this.container.redisClient.insertFor60Seconds<DocsearchHit>(RedisKeys.Sapphire, args.query, index.toString(), hit)
				);

				results.push({
					name: cutText(hierarchicalName, 100),
					value: `${RedisKeys.Sapphire}:${args.query}:${index}`
				});
			}
		}

		if (redisInsertPromises.length) {
			await Promise.all(redisInsertPromises);
		}

		return interaction.reply({
			choices: results.slice(0, 19)
		});
	}

	@RegisterSubcommand(buildSubcommandBuilders('docs', 'Search the sapphire documentation'))
	@RegisterSubcommand(buildSubcommandBuilders('guide', 'Search the sapphire guide'))
	protected async sharedRun(interaction: Command.Interaction, { subCommand, query, target }: InteractionArguments<Args>) {
		const docsOrGuide = cast<'docs' | 'guide'>(subCommand);

		const [, queryFromAutocomplete, nthResult] = query.split(':');
		const hitFromRedisCache = await this.container.redisClient.fetch<DocsearchHit>(RedisKeys.Sapphire, queryFromAutocomplete, nthResult);

		const headerText = docsOrGuide === 'docs' ? this.#docsResponseHeaderText : this.#guideResponseHeaderText;

		if (hitFromRedisCache) {
			const hierarchicalName = buildHierarchicalName(hitFromRedisCache.hierarchy, true);

			if (hierarchicalName) {
				return interaction.reply({
					content: buildResponseContent({
						content: hyperlink(hierarchicalName, hideLinkEmbed(hitFromRedisCache.url)),
						target: target?.user.id,
						headerText,
						icon: SapphireGemId
					})
				});
			}
		}

		const algoliaResponse = await this.fetchApi(docsOrGuide, queryFromAutocomplete ?? query, 5);

		if (!algoliaResponse.hits.length) {
			return interaction.reply(
				errorResponse({
					content: `no results were found for ${inlineCode(queryFromAutocomplete ?? query)}`,
					allowed_mentions: {
						users: target?.user.id ? [target?.user.id] : []
					}
				})
			);
		}

		const results = algoliaResponse.hits
			.map(({ hierarchy, url, url_without_anchor }) => {
				const lvl3Text = hierarchy.lvl3 ? ` - ${hierarchy.lvl3}` : '';

				const pageSegment = url_without_anchor?.split('/').slice(-3).join('/').replace(/\/$/, '');
				const pageSegmentPrepend = pageSegment ? `${pageSegment} - ` : '';
				const hitUrl = hyperlink(`${pageSegmentPrepend}${hierarchy.lvl2 ?? hierarchy.lvl1 ?? 'click here'}`, hideLinkEmbed(url));
				const hitLabel = hierarchy.lvl0 ?? hierarchy.lvl1 ?? '';

				return he.decode(`${hitLabel}: ${hitUrl}${lvl3Text}`);
			})
			.map(replaceDotHtml)
			.map(replaceWww);

		return interaction.reply({
			content: buildResponseContent({
				content: unorderedList([...new Set(results)]),
				target: target?.user.id,
				headerText,
				icon: SapphireGemId
			}),
			allowed_mentions: {
				users: target?.user.id ? [target?.user.id] : []
			}
		});
	}

	private async fetchApi(subCommand: 'docs' | 'guide', query: string, hitsPerPage = 25) {
		return fetch<AlgoliaSearchResult<'docsearch'>>(
			this.#algoliaUrl,
			{
				method: FetchMethods.Post,
				body: JSON.stringify({
					params: new URLSearchParams({
						facetFilters: [`guide:${subCommand === 'guide' ? 'true' : 'false'}`],
						hitsPerPage: hitsPerPage.toString(),
						query
					}).toString()
				}),
				headers: {
					'Content-Type': 'application/json',
					'X-Algolia-API-Key': envParseString('SAPPHIRE_DOCS_ALOGLIA_APPLICATION_KEY'),
					'X-Algolia-Application-Id': envParseString('SAPPHIRE_DOCS_ALOGLIA_APPLICATION_ID'),
					'User-Agent': FetchUserAgent
				}
			},
			FetchResultTypes.JSON
		);
	}
}

function buildSubcommandBuilders(name: 'docs' | 'guide', description: string) {
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

function replaceWww(url: string) {
	return url.replaceAll('www.sapphirejs.dev', 'sapphirejs.dev');
}

interface Args {
	query: string;
	target?: TransformedArguments.User;
}

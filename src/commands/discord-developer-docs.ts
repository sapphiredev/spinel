import { FetchUserAgent } from '#constants/constants';
import { DiscordDevelopersIcon } from '#constants/emotes';
import { envParseString } from '#env/utils';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { AlgoliaHit, AlgoliaSearchResult } from '#types/Algolia';
import { buildHierarchicalName, buildResponseContent } from '#utils/algolia-utils';
import { errorResponse } from '#utils/response-utils';
import { redisCache } from '#utils/setup';
import { getGuildIds } from '#utils/utils';
import { hideLinkEmbed, hyperlink, inlineCode } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { cutText } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds, type AutocompleteInteractionArguments, type TransformedArguments } from '@skyra/http-framework';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import he from 'he';
import { URLSearchParams } from 'node:url';

@RegisterCommand((builder) =>
	builder //
		.setName('discord-developer-docs')
		.setDescription('Search Discord Developer documentation')
		.addStringOption((builder) =>
			builder //
				.setName('query')
				.setDescription('The phrase to search for')
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addUserOption((builder) =>
			builder //
				.setName('target')
				.setDescription('Who should I ping that should look at these results?')
		)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	#algoliaUrl = new URL(`https://${envParseString('DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID')}.algolia.net/1/indexes/discord/query`);
	#responseHeaderText = 'Discord Developer docs results:';

	public override async autocompleteRun(_: never, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'query') {
			return this.autocompleteNoResults();
		}

		const algoliaResponse = await this.fetchApi(args.query);

		const redisInsertPromises: Promise<'OK'>[] = [];
		const results: APIApplicationCommandOptionChoice[] = [];

		for (const [index, hit] of algoliaResponse.hits.entries()) {
			const hierarchicalName = buildHierarchicalName(hit.hierarchy);

			if (hierarchicalName) {
				redisInsertPromises.push(redisCache.insertFor60Seconds<AlgoliaHit>(RedisKeys.DiscordDocs, args.query, index.toString(), hit));

				results.push({
					name: cutText(hierarchicalName, 100),
					value: `${RedisKeys.DiscordDocs}:${args.query}:${index}`
				});
			}
		}

		if (redisInsertPromises.length) {
			await Promise.all(redisInsertPromises);
		}

		return this.autocomplete({
			choices: results.slice(0, 19)
		});
	}

	public override async chatInputRun(_: never, { query, target }: Args) {
		const [, queryFromAutocomplete, nthResult] = query.split(':');
		const hitFromRedisCache = await redisCache.fetch<AlgoliaHit>(RedisKeys.DiscordDocs, queryFromAutocomplete, nthResult);

		if (hitFromRedisCache) {
			const hierarchicalName = buildHierarchicalName(hitFromRedisCache.hierarchy, true);

			if (hierarchicalName) {
				return this.message({
					content: buildResponseContent({
						content: hyperlink(hierarchicalName, hideLinkEmbed(hitFromRedisCache.url)),
						target: target?.user.id,
						headerText: this.#responseHeaderText,
						icon: DiscordDevelopersIcon
					})
				});
			}
		}

		const algoliaResponse = await this.fetchApi(queryFromAutocomplete ?? query, 5);

		if (!algoliaResponse.hits.length) {
			return this.message(
				errorResponse({
					content: `no results were found for ${inlineCode(queryFromAutocomplete ?? query)}`,
					allowed_mentions: {
						users: target?.user.id ? [target?.user.id] : []
					}
				})
			);
		}

		const results = algoliaResponse.hits.map(({ hierarchy, url }) =>
			he.decode(
				`• ${hierarchy.lvl0 ?? hierarchy.lvl1 ?? ''}: ${hyperlink(
					`${hierarchy.lvl2 ?? hierarchy.lvl1 ?? 'click here'}`,
					hideLinkEmbed(url)
				)}${hierarchy.lvl3 ? ` - ${hierarchy.lvl3}` : ''}`
			)
		);

		return this.message({
			content: buildResponseContent({
				content: results,
				target: target?.user.id,
				headerText: this.#responseHeaderText,
				icon: DiscordDevelopersIcon
			}),
			allowed_mentions: {
				users: target?.user.id ? [target?.user.id] : []
			}
		});
	}

	private async fetchApi(query: string, hitsPerPage = 20) {
		return fetch<AlgoliaSearchResult>(
			this.#algoliaUrl,
			{
				method: FetchMethods.Post,
				body: JSON.stringify({
					params: new URLSearchParams({
						query,
						hitsPerPage: hitsPerPage.toString()
					}).toString()
				}),
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': FetchUserAgent,
					'X-Algolia-API-Key': envParseString('DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_KEY'),
					'X-Algolia-Application-Id': envParseString('DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID')
				}
			},
			FetchResultTypes.JSON
		);
	}
}

interface Args {
	query: string;
	target?: TransformedArguments.User;
}

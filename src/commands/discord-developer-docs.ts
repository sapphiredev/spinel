import { FailPrefix } from '#constants/constants';
import { DiscordDevelopersIcon } from '#constants/emotes';
import { envParseString } from '#env/utils';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { AlgoliaSearchResult } from '#types/Algolia';
import { buildHierarchicalName, buildResponseContent } from '#utils/algolia-utils';
import { redisCache } from '#utils/setup';
import { getGuildIds } from '#utils/utils';
import { hideLinkEmbed, hyperlink, inlineCode } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { cutText } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds, TransformedArguments } from '@skyra/http-framework';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v9';
import he from 'he';
import { stringify } from 'node:querystring';

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

	public override async autocompleteRun(_: never, _2: never, { query }: Args) {
		const algoliaResponse = await this.fetchApi(query);

		const results: APIApplicationCommandOptionChoice[] = [];
		const redisInsertPromises: Promise<'OK'>[] = [];

		for (const [index, hit] of algoliaResponse.hits.entries()) {
			const hierarchicalName = buildHierarchicalName(hit.hierarchy);

			if (hierarchicalName) {
				redisInsertPromises.push(redisCache.insertFor60Seconds(RedisKeys.DiscordDocs, query, index.toString(), hit));

				results.push({
					name: cutText(hierarchicalName, 100),
					value: `${RedisKeys.DiscordDocs}:${query}:${index}`
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
		const hitFromRedisCache = await redisCache.fetch(RedisKeys.DiscordDocs, queryFromAutocomplete, nthResult);

		if (hitFromRedisCache) {
			const hierarchicalName = buildHierarchicalName(hitFromRedisCache.hierarchy, true);

			if (hierarchicalName) {
				return this.message({
					content: buildResponseContent({
						content: hyperlink(hierarchicalName, hideLinkEmbed(hitFromRedisCache.url)),
						target: target?.user.id,
						headerText: 'Discord Developer docs results:',
						icon: DiscordDevelopersIcon
					})
				});
			}
		}

		const algoliaResponse = await this.fetchApi(query, 5);

		if (!algoliaResponse.hits.length) {
			return this.message({
				content: `${FailPrefix} No results found for ${inlineCode(query)}`,
				allowed_mentions: {
					users: target?.user.id ? [target?.user.id] : []
				}
			});
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
				headerText: 'Discord Developer docs results:',
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
					params: stringify({
						query,
						hitsPerPage
					})
				}),
				headers: {
					'Content-Type': 'application/json',
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

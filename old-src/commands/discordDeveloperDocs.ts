import { DiscordDevelopersIcon } from '#constants/emotes';
import { envParseString } from '#env/utils';
import type { AlgoliaSearchResult } from '#types/Algolia';
import type { FastifyResponse } from '#types/Api';
import { interactionResponse, noResultsErrorResponse, sendJson } from '#utils/responseHelpers';
import { bold, hideLinkEmbed, hyperlink, italic, userMention } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import he from 'he';
import { stringify } from 'node:querystring';

export async function discordDeveloperDocs({ response, query, target, amountOfResults }: DiscordDeveloperDocsParameters): Promise<FastifyResponse> {
	const algoliaUrl = new URL(`https://${envParseString('DISCORD_DEVELOPER_DOCS_ALGOLIA_APPLICATION_ID')}.algolia.net/1/indexes/discord/query`);

	const algoliaResponse = await fetch<AlgoliaSearchResult>(
		algoliaUrl,
		{
			method: FetchMethods.Post,
			body: JSON.stringify({
				params: stringify({
					query,
					hitsPerPage: 5
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

	if (!algoliaResponse.hits.length) {
		return noResultsErrorResponse(response);
	}

	const slicedHits = algoliaResponse.hits.slice(0, amountOfResults);

	const result = slicedHits.map(({ hierarchy, url }) =>
		he.decode(
			`• ${hierarchy.lvl0 ?? hierarchy.lvl1 ?? ''}: ${hyperlink(`${hierarchy.lvl2 ?? hierarchy.lvl1 ?? 'click here'}`, hideLinkEmbed(url))}${
				hierarchy.lvl3 ? ` - ${hierarchy.lvl3}` : ''
			}`
		)
	);

	const content = [
		target ? `${italic(`Documentation suggestion for ${userMention(target)}:`)}\n` : undefined, //
		DiscordDevelopersIcon,
		' ',
		bold('Discord Developer docs results:'),
		'\n',
		result.join('\n')
	]
		.filter(Boolean)
		.join('');

	return sendJson(
		response,
		interactionResponse({
			content,
			users: target ? [target] : []
		})
	);
}

interface DiscordDeveloperDocsParameters {
	response: FastifyResponse;
	query: string;
	amountOfResults: number;
	target: Snowflake;
}

import { DjsGuideIcon } from '#constants/emotes';
import { envParseString } from '#env/utils';
import type { AlgoliaSearchResult } from '#types/Algolia';
import type { FastifyResponse } from '#types/Api';
import { errorResponse, interactionResponse, sendJson } from '#utils/responseHelpers';
import { bold, hideLinkEmbed, hyperlink, italic, userMention } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import he from 'he';
import { stringify } from 'node:querystring';

export async function djsGuide({ response, query, amountOfResults, target }: DjsGuideParameters): Promise<FastifyResponse> {
	const algoliaUrl = new URL(`https://${envParseString('DJS_GUIDE_ALGOLIA_APPLICATION_ID')}.algolia.net/1/indexes/discordjs/query`);

	const algoliaResponse = await fetch<AlgoliaSearchResult>(
		algoliaUrl,
		{
			method: FetchMethods.Post,
			body: JSON.stringify({
				params: stringify({
					query,
					facetFilters: ['lang:en-US'],
					hitsPerPage: 5
				})
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-Algolia-API-Key': envParseString('DJS_GUIDE_ALGOLIA_APPLICATION_KEY'),
				'X-Algolia-Application-Id': envParseString('DJS_GUIDE_ALGOLIA_APPLICATION_ID')
			}
		},
		FetchResultTypes.JSON
	);

	if (!algoliaResponse.hits.length) {
		return sendJson(
			response,
			errorResponse({
				content: 'I was not able to find anything with provided parameters.'
			})
		);
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
		target ? `${italic(`Guide suggestion for ${userMention(target)}:`)}\n` : undefined, //
		DjsGuideIcon,
		' ',
		bold('discordjs.guide results:'),
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

interface DjsGuideParameters {
	response: FastifyResponse;
	query: string;
	amountOfResults: number;
	target: Snowflake;
}

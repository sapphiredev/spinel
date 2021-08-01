import { bold, hideLinkEmbed, hyperlink, italic } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import type { Snowflake } from 'discord-api-types/v9';
import { stringify } from 'querystring';
import { AlgoliaUrl } from '../lib/constants';
import { DjsGuideIcon } from '../lib/emotes';
import { AlgoliaApplicationId, AlgoliaApplicationKey } from '../lib/env';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';

export async function djsGuide({ response, query, amountOfResults, target }: DjsGuideParameters): Promise<VercelResponse> {
	const algoliaResponse = await fetch<AlgoliaSearchResult>(
		AlgoliaUrl,
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
				'X-Algolia-API-Key': AlgoliaApplicationKey,
				'X-Algolia-Application-Id': AlgoliaApplicationId
			}
		},
		FetchResultTypes.JSON
	);

	if (!algoliaResponse.hits.length) {
		return response.json(
			errorResponse({
				content: 'I was not able to find anything with provided parameters.'
			})
		);
	}

	const slicedHits = algoliaResponse.hits.slice(0, amountOfResults);

	const result = slicedHits.map(
		({ hierarchy, url }) =>
			`• ${hierarchy.lvl0 ?? hierarchy.lvl1 ?? ''}: ${hyperlink(`${hierarchy.lvl2 ?? hierarchy.lvl1 ?? 'click here'}`, hideLinkEmbed(url))}${
				hierarchy.lvl3 ? ` - ${hierarchy.lvl3}` : ''
			}`
	);

	const content = [
		target ? `${italic(`Guide suggestion for <@${target}>:`)}\n` : undefined, //
		DjsGuideIcon,
		' ',
		bold('discordjs.guide results:'),
		'\n',
		result.join('\n')
	]
		.filter(Boolean)
		.join('');

	return response.json(
		interactionResponse({
			content,
			users: target ? [target] : []
		})
	);
}

interface DjsGuideParameters {
	response: VercelResponse;
	query: string;
	amountOfResults: number;
	target: Snowflake;
}

interface AlgoliaSearchResult {
	hits: AlgoliaHit[];
	query: string;
}

interface AlgoliaHit {
	anchor: string;
	content: string | null;
	hierarchy: AlgoliaHitHierarchy;
	url: string;
}

interface AlgoliaHitHierarchy {
	lvl0: string | null;
	lvl1: string | null;
	lvl2: string | null;
	lvl3: string | null;
	lvl4: string | null;
	lvl5: string | null;
	lvl6: string | null;
}

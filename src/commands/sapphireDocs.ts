import { SapphireGemId } from '#constants/emotes';
import { envParseString } from '#env/utils';
import type { AlgoliaSearchResult } from '#types/Algolia';
import type { FastifyResponse } from '#types/Api';
import { interactionResponse, noResultsErrorResponse, sendJson } from '#utils/responseHelpers';
import { bold, hideLinkEmbed, hyperlink, italic, userMention } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import he from 'he';
import { stringify } from 'node:querystring';

export async function sapphireDocs({
	response,
	query,
	amountOfResults,
	shouldIncludeDocs,
	target
}: SapphireDocsParameters): Promise<FastifyResponse> {
	const algoliaUrl = new URL(`https://${envParseString('SAPPHIRE_DOCS_ALOGLIA_APPLICATION_ID')}-dsn.algolia.net/1/indexes/sapphirejs/query`);

	const algoliaResponse = await fetch<AlgoliaSearchResult>(
		algoliaUrl,
		{
			method: FetchMethods.Post,
			body: JSON.stringify({
				params: stringify({
					query,
					hitsPerPage: 5,
					attributesToSnippet: [
						'hierarchy.lvl1:10',
						'hierarchy.lvl2:10',
						'hierarchy.lvl3:10',
						'hierarchy.lvl4:10',
						'hierarchy.lvl5:10',
						'hierarchy.lvl6:10',
						'content:10'
					]
				})
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-Algolia-API-Key': envParseString('SAPPHIRE_DOCS_ALOGLIA_APPLICATION_KEY'),
				'X-Algolia-Application-Id': envParseString('SAPPHIRE_DOCS_ALOGLIA_APPLICATION_ID')
			}
		},
		FetchResultTypes.JSON
	);

	if (!algoliaResponse.hits.length) {
		return noResultsErrorResponse(response);
	}

	let slicedHits = algoliaResponse.hits.slice(0, amountOfResults);

	if (!shouldIncludeDocs) {
		slicedHits = slicedHits.filter(({ url }) => url.includes('/Guide/'));
	}

	if (!slicedHits.length) {
		return noResultsErrorResponse(response);
	}

	const result = slicedHits.map(({ hierarchy, url }) =>
		he.decode(
			`• ${hierarchy.lvl0 ?? hierarchy.lvl1 ?? ''}: ${hyperlink(`${hierarchy.lvl2 ?? hierarchy.lvl1 ?? 'click here'}`, hideLinkEmbed(url))}${
				hierarchy.lvl3 ? ` - ${hierarchy.lvl3}` : ''
			}`
		)
	);

	const content = [
		target ? `${italic(`Sapphire Documenation suggestion for ${userMention(target)}:`)}\n` : undefined, //
		SapphireGemId,
		' ',
		bold(`${hyperlink('sapphirejs.dev', hideLinkEmbed('https://www.sapphirejs.dev'))} results:`),
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

interface SapphireDocsParameters {
	response: FastifyResponse;
	shouldIncludeDocs: boolean;
	query: string;
	amountOfResults: number;
	target: Snowflake;
}

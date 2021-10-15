import { bold, hideLinkEmbed, hyperlink, italic, userMention } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import { decode } from 'he';
import { stringify } from 'querystring';
import { DiscordDeveloperDocsAlgoliaUrl } from '../lib/constants/constants';
import { DiscordDevelopersIcon } from '../lib/constants/emotes';
import type { AlgoliaSearchResult } from '../lib/types/Algolia';
import type { FastifyResponse } from '../lib/types/Api';
import { DiscordDeveloperDocsAlgoliaApplicationId, DiscordDeveloperDocsAlgoliaApplicationKey } from '../lib/util/env';
import { errorResponse, interactionResponse, sendJson } from '../lib/util/responseHelpers';

export async function discordDeveloperDocs({ response, query, target, amountOfResults }: DiscordDeveloperDocsParameters): Promise<FastifyResponse> {
	const algoliaResponse = await fetch<AlgoliaSearchResult>(
		DiscordDeveloperDocsAlgoliaUrl,
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
				'X-Algolia-API-Key': DiscordDeveloperDocsAlgoliaApplicationKey,
				'X-Algolia-Application-Id': DiscordDeveloperDocsAlgoliaApplicationId
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
		decode(
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

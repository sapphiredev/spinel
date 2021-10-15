import { inlineCode } from '@discordjs/builders';
import type { VercelResponse } from '@vercel/node';
import type { Snowflake } from 'discord-api-types/v9';
import { SapphireGemId } from '../lib/constants/emotes';
import { errorResponse, interactionResponse, selectMenuResponse } from '../lib/util/responseHelpers';
import { findSimilar, findTag, mapTagSimilarityEntry } from '../lib/util/tags';

export function showTag({ response, query, target }: ShowTagParameters): VercelResponse {
	const content = findTag(query, target);

	if (content) {
		return response.json(
			interactionResponse({
				content,
				users: target ? [target] : []
			})
		);
	}

	const similar = findSimilar(query);

	if (similar.length) {
		return response.json(
			selectMenuResponse({
				selectMenuOptions: similar.map(mapTagSimilarityEntry),
				customId: `tag|${target ?? ''}`,
				content: `${SapphireGemId} Could not find a tag with name or alias ${inlineCode(query)}. Select a similar tag to send instead:`
			})
		);
	}

	return response.json(errorResponse({ content: `Could not find a tag with name or alias similar to ${inlineCode(query)}` }));
}

interface ShowTagParameters {
	response: VercelResponse;
	query: string;
	target: Snowflake;
}

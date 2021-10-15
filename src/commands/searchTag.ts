import { inlineCode } from '@discordjs/builders';
import type { APISelectMenuOption, Snowflake } from 'discord-api-types/v9';
import { MaxMessageLength } from '../lib/constants/constants';
import { SapphireGemId } from '../lib/constants/emotes';
import type { FastifyResponse } from '../lib/types/Api';
import { errorResponse, selectMenuResponse, sendJson } from '../lib/util/responseHelpers';
import { tagCache } from '../lib/util/tags';

export function searchTag({ response, query, target }: SearchTagParameters): FastifyResponse {
	const results: APISelectMenuOption[] = [];

	for (const [key, tag] of tagCache.entries()) {
		const foundKeyword = tag.keywords.find((s) => s.toLowerCase().includes(query));
		const isContentMatch = tag.content.toLowerCase().includes(query);
		if (foundKeyword || isContentMatch) {
			if (results.join(', ').length + tag.keywords.length + 6 < MaxMessageLength) {
				results.push({
					label: key,
					value: key,
					emoji: {
						id: SapphireGemId
					}
				});
			}
		}
	}

	if (results.length) {
		return sendJson(
			response,
			selectMenuResponse({
				selectMenuOptions: results,
				customId: `tag|${target ?? ''}`,
				content: 'Select a tag to send:'
			})
		);
	}

	return sendJson(response, errorResponse({ content: `Could not find a tag with name or alias similar to ${inlineCode(query)}` }));
}

interface SearchTagParameters {
	response: FastifyResponse;
	query: string;
	target: Snowflake;
}

import { inlineCode } from '@discordjs/builders';
import type { VercelResponse } from '@vercel/node';
import type { APISelectMenuOption, Snowflake } from 'discord-api-types/v9';
import { MaxMessageLength } from '../lib/constants/constants';
import { SapphireGemId } from '../lib/constants/emotes';
import { errorResponse, selectMenuResponse } from '../lib/util/responseHelpers';
import { tagCache } from '../lib/util/tags';

export function searchTag({ response, query, target }: SearchTagParameters): VercelResponse {
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
		return response.json(
			selectMenuResponse({
				selectMenuOptions: results,
				customId: `tag|${target ?? ''}`,
				content: 'Select a tag to send:'
			})
		);
	}

	return response.json(errorResponse({ content: `Could not find a tag with name or alias similar to ${inlineCode(query)}` }));
}

interface SearchTagParameters {
	response: VercelResponse;
	query: string;
	target: Snowflake;
}

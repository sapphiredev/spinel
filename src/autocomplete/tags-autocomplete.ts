import type { FastifyResponse } from '#types/Api';
import { interactionResponseAutocomplete, sendJson } from '#utils/responseHelpers';
import { tagCache } from '#utils/tags';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v9';

export function tagsAutocomplete({ response, query }: HandleTagsAutocompleteParameters): FastifyResponse {
	const results: APIApplicationCommandOptionChoice[] = [];

	if (query.length) {
		const keywordMatches: APIApplicationCommandOptionChoice[] = [];
		const contentMatches: APIApplicationCommandOptionChoice[] = [];
		const exactKeywords: APIApplicationCommandOptionChoice[] = [];

		for (const [key, tag] of tagCache.entries()) {
			const exactKeyword = tag.keywords.find((s) => s.toLowerCase() === query.toLowerCase());
			const includesKeyword = tag.keywords.find((s) => s.toLowerCase().includes(query.toLowerCase()));
			const isContentMatch = tag.content.toLowerCase().includes(query);

			if (exactKeyword) {
				exactKeywords.push({
					name: `⭐ ${key}`,
					value: key
				});
			} else if (includesKeyword) {
				keywordMatches.push({
					name: `🏷️ ${key}`,
					value: key
				});
			} else if (isContentMatch) {
				contentMatches.push({
					name: `📄 ${key}`,
					value: key
				});
			}
		}

		results.push(...exactKeywords, ...keywordMatches, ...contentMatches);
	} else {
		results.push(
			...tagCache
				.filter((t) => t.hoisted)
				.map((_, key) => {
					return {
						name: `📌 ${key}`,
						value: key
					};
				})
		);
	}

	return sendJson(response, interactionResponseAutocomplete({ choices: results.slice(0, 19) }));
}

interface HandleTagsAutocompleteParameters {
	response: FastifyResponse;
	query: string;
}

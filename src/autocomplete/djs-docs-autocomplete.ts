import type { FastifyResponse } from '#types/Api';
import { fetchDocs } from '#utils/discordjs-docs';
import { interactionResponseAutocomplete, sendJson } from '#utils/responseHelpers';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v9';
import type { SourcesStringUnion } from 'discordjs-docs-parser';

export async function djsDocsAutocomplete({ response, query, source }: HandleDjsDocsAutocompleteParameters): Promise<FastifyResponse> {
	const results: APIApplicationCommandOptionChoice[] = [];

	const doc = await fetchDocs(source);

	if (query.length) {
		const element = doc.get(...query.split(/\.|#/));
		if (element) {
			results.push({ name: element.formattedName, value: element.formattedName });
		} else {
			const searchResult = doc.search(query) ?? [];
			for (const r of searchResult) {
				results.push({
					name: r.formattedName,
					value: r.formattedName
				});
			}
		}
	} else {
		const searchResult = doc.search('Client') ?? [];
		for (const r of searchResult) {
			results.push({
				name: r.formattedName,
				value: r.formattedName
			});
		}
	}

	return sendJson(response, interactionResponseAutocomplete({ choices: results.slice(0, 19) }));
}

interface HandleDjsDocsAutocompleteParameters {
	response: FastifyResponse;
	source: SourcesStringUnion;
	query: string;
}

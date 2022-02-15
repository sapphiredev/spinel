import type { FastifyResponse } from '#types/Api';
import { fuzzilySearchForRepository } from '#utils/github-fetch';
import { interactionResponseAutocomplete, sendJson } from '#utils/responseHelpers';

export async function ghRepoAutocomplete({ response, repository }: HandleGhRepoAutocompleteParameters): Promise<FastifyResponse> {
	const results = await fuzzilySearchForRepository({ repository });

	return sendJson(response, interactionResponseAutocomplete({ choices: results.slice(0, 19) }));
}

interface HandleGhRepoAutocompleteParameters {
	response: FastifyResponse;
	repository: string;
}

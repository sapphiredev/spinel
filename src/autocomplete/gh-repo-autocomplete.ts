import type { FastifyResponse } from '#types/Api';
import { fuzzilySearchForRepository } from '#utils/github-fetch';
import { interactionResponseAutocomplete, sendJson } from '#utils/responseHelpers';
import { getKnownGitHubOrganizationsForServerId } from '#utils/utils';
import { isNullishOrEmpty } from '@sapphire/utilities';

export async function ghRepoAutocomplete({ response, repository, guildId }: HandleGhRepoAutocompleteParameters): Promise<FastifyResponse> {
	if (!isNullishOrEmpty(guildId) && (repository === '' || repository === '@')) {
		const knownOrganizationForGuild = getKnownGitHubOrganizationsForServerId(guildId);
		repository = `@${knownOrganizationForGuild}`;
	}

	const results = await fuzzilySearchForRepository({ repository });

	return sendJson(response, interactionResponseAutocomplete({ choices: results.slice(0, 19) }));
}

interface HandleGhRepoAutocompleteParameters {
	response: FastifyResponse;
	repository: string;
	guildId?: string;
}

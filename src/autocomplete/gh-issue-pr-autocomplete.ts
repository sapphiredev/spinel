import type { FastifyResponse } from '#types/Api';
import { fuzzilySearchForIssuesAndPullRequests } from '#utils/github-fetch';
import { interactionResponseAutocomplete, sendJson } from '#utils/responseHelpers';
import { getKnownGitHubOrganizationsForServerId } from '#utils/utils';
import { isNullishOrEmpty } from '@sapphire/utilities';

export async function ghIssuePrAutocomplete({
	response,
	repository,
	owner,
	number,
	guildId
}: HandleGhIssuePrAutocompleteParameters): Promise<FastifyResponse> {
	if (!isNullishOrEmpty(guildId) && (repository === '' || repository === '@')) {
		const knownOrganizationForGuild = getKnownGitHubOrganizationsForServerId(guildId);
		repository = `@${knownOrganizationForGuild}`;
		owner = knownOrganizationForGuild;
	}

	if (isNullishOrEmpty(repository) || isNullishOrEmpty(owner)) {
		// If there is no repository or owner then return an empty array of options
		return sendJson(response, interactionResponseAutocomplete({ choices: [] }));
	}

	const results = await fuzzilySearchForIssuesAndPullRequests({ repository, owner, number });

	return sendJson(response, interactionResponseAutocomplete({ choices: results.slice(0, 19) }));
}

interface HandleGhIssuePrAutocompleteParameters {
	response: FastifyResponse;
	repository: string;
	owner: string;
	number: string;
	guildId?: string;
}

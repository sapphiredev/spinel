import { KnownServerIdsToGitHubOrganizations, preferredRepositories, sapphirePreferredRepositories } from '#constants/constants';
import { userMention } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { envParseArray } from '@skyra/env-utilities';

export function getGuildIds(): readonly string[] {
	return envParseArray('COMMAND_GUILD_IDS', []);
}

export function suggestionString(suggestionType: string, guaranteed?: string, target?: string): string {
	const messageParts = [];
	const [first, ...rest] = suggestionType;

	if (target) {
		messageParts.push(`*${first.toUpperCase()}${rest.join('')} suggestion`);

		if (target) {
			messageParts.push(` for ${userMention(target)}`);
		}

		messageParts.push(':*\n');
	}

	if (guaranteed) {
		messageParts.push(guaranteed);
	}

	return messageParts.join('');
}

/**
 * Fake GraphQL tag that just returns everything passed in as a single combined string
 * @remark used to trick the GraphQL parser into treating some code as GraphQL data for syntax checking
 * @param args data to pass off as GraphQL code
 */
export function gql(...args: any[]): string {
	return args[0].reduce((acc: string, str: string, idx: number) => {
		acc += str;
		if (Reflect.has(args, idx + 1)) acc += args[idx + 1];
		return acc;
	}, '');
}

export function getKnownGitHubOrganizationsForServerId(serverId?: string) {
	if (isNullishOrEmpty(serverId)) {
		return 'sapphiredev';
	}

	const knownServerId = KnownServerIdsToGitHubOrganizations.get(serverId);

	return knownServerId ?? 'sapphiredev';
}

export function getPreferredRepositoriesForServerId(serverId?: string) {
	if (isNullishOrEmpty(serverId)) {
		return sapphirePreferredRepositories;
	}

	const preferred = preferredRepositories.get(serverId);

	return preferred ?? sapphirePreferredRepositories;
}

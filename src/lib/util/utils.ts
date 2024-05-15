import { KnownServerIdsToGitHubOrganizations, preferredRepositories, sapphirePreferredRepositories } from '#constants/constants';
import { HeadingLevel, heading, italic, userMention } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { envParseArray } from '@skyra/env-utilities';
import type { MessageResponseOptions } from '@skyra/http-framework';
import { ComponentType, type APISelectMenuOption } from 'discord-api-types/v10';

export function getGuildIds(): readonly string[] {
	return envParseArray('COMMAND_GUILD_IDS', []);
}

export function suggestionString(tagContent: string, target?: string): string {
	const messageParts: string[] = [tagContent];

	if (target) {
		messageParts.unshift(heading(italic(`Tag suggestion for ${userMention(target)}`), HeadingLevel.Three));
	}

	return messageParts.join('\n');
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

/**
 * Constructs an interaction reply payload with a select menu
 * @param customId The Custom ID for the select menu
 * @param selectMenuOptions The options to display in the select menu
 * @param otherData The other data to send with the interaction reply
 */
export function buildSelectMenuResponse(
	customId: string,
	selectMenuOptions: APISelectMenuOption[],
	otherData: MessageResponseOptions
): MessageResponseOptions {
	return {
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.StringSelect,
						custom_id: customId,
						options: selectMenuOptions
					}
				]
			}
		],
		...otherData
	};
}

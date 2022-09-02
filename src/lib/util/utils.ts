import { KnownServerIdsToGitHubOrganizations, preferredRepositories, sapphirePreferredRepositories } from '#constants/constants';
import { userMention } from '@discordjs/builders';
import type { RawFile } from '@discordjs/rest';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { envParseArray } from '@skyra/env-utilities';
import { container, InteractionHandler, MessageResponseOptions } from '@skyra/http-framework';
import {
	ComponentType,
	Routes,
	type APISelectMenuOption,
	type RESTPostAPIInteractionFollowupJSONBody,
	type RESTPostAPIInteractionFollowupResult
} from 'discord-api-types/v10';

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
						type: ComponentType.SelectMenu,
						custom_id: customId,
						options: selectMenuOptions
					}
				]
			}
		],
		...otherData
	};
}

/**
 * Sends an original interaction message response patch HTTP request.
 * @param interaction The received interaction from Discord.
 * @param body The body to be sent in the HTTP call.
 * @returns An API message.
 */
export function postMessage(interaction: InteractionHandler.SelectMenuInteraction, { files, ...body }: PostMessageOptions) {
	return container.rest.post(Routes.webhook(interaction.application_id, interaction.token), {
		body,
		files,
		auth: false
	}) as Promise<RESTPostAPIInteractionFollowupResult>;
}

type PostMessageOptions = RESTPostAPIInteractionFollowupJSONBody & { files?: RawFile[] };

import { SapphireModeratorSnowflake } from '#constants/constants';
import type { FastifyResponse } from '#types/Api';
import { errorResponse, interactionResponse, sendJson } from '#utils/responseHelpers';
import { loadTags, tagCache } from '#utils/tags';
import { roleMention, userMention } from '@discordjs/builders';
import type { APIInteractionGuildMember } from 'discord-api-types/v9';

export async function reloadTags({ response, member }: ReloadTagsParameters): Promise<FastifyResponse> {
	if (!member) {
		return sendJson(
			response,
			errorResponse({
				content: `This command can only be used in the Sapphire server`
			})
		);
	}

	if (!member.roles.includes(SapphireModeratorSnowflake)) {
		return sendJson(
			response,
			errorResponse({
				content: `You need to have the Sapphire ${roleMention(SapphireModeratorSnowflake)} role to use this command`
			})
		);
	}

	try {
		tagCache.clear();
		await loadTags();

		return sendJson(
			response,
			interactionResponse({
				content: 'Successfully reloaded all tags',
				ephemeral: true
			})
		);
	} catch (error) {
		return sendJson(
			response,
			errorResponse({
				content: `Oh oh.. something went wrong reloading the tags. Better contact ${userMention('268792781713965056')}`
			})
		);
	}
}

interface ReloadTagsParameters {
	response: FastifyResponse;
	member: APIInteractionGuildMember | undefined;
}

import { FailPrefix } from '#constants/constants';
import { MessageFlags, type APIInteractionResponseCallbackData } from 'discord-api-types/v10';

export function errorResponse(data: APIInteractionResponseCallbackData): APIInteractionResponseCallbackData {
	return {
		...data,
		content: `${FailPrefix} ${data.content}`,
		flags: MessageFlags.Ephemeral
	};
}

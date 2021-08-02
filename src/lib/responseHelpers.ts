import {
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	InteractionResponseType,
	MessageFlags,
	Snowflake
} from 'discord-api-types/v9';
import { FailPrefix } from './constants';

export function interactionResponse({ content, ephemeral = false, users = [] }: ResponseParameters): APIInteractionResponseChannelMessageWithSource {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content,
			flags: ephemeral ? MessageFlags.Ephemeral : 0,
			allowed_mentions: { users }
		}
	};
}

export function errorResponse({ content, ...parameters }: ResponseParameters): APIInteractionResponse {
	return interactionResponse({ ...parameters, content: `${FailPrefix} ${content}`, ephemeral: true });
}

interface ResponseParameters {
	content: string;
	ephemeral?: boolean;
	users?: Snowflake[];
}

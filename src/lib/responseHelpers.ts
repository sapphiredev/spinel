import {
	AllowedMentionsTypes,
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	InteractionResponseType,
	MessageFlags,
	Snowflake
} from 'discord-api-types/v9';
import { FailPrefix } from './constants';

export function interactionResponse({
	content,
	ephemeral = false,
	users = [],
	parse = []
}: ResponseParameters): APIInteractionResponseChannelMessageWithSource {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content,
			flags: ephemeral ? MessageFlags.Ephemeral : 0,
			allowed_mentions: { parse, users }
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
	parse?: AllowedMentionsTypes[];
}

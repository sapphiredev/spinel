import { AllowedMentionsTypes, APIInteractionResponse, InteractionResponseType, MessageFlags, Snowflake } from 'discord-api-types';
import { FailPrefix } from './constants';

export function interactionResponse({ content, ephemeral = false, users = [], parse = [] }: ResponseParameters): APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content,
			flags: ephemeral ? MessageFlags.EPHEMERAL : 0,
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

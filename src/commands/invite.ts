import { APIInteractionResponse, InteractionResponseType, MessageFlags } from 'discord-api-types';
import { ApplicationId } from '../lib/constants';

export function invite(): APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.EPHEMERAL,
			content: `Add the Sapphire interaction to your server: [(click here)](<https://discord.com/api/oauth2/authorize?client_id=${ApplicationId}&scope=applications.commands>)`
		}
	};
}

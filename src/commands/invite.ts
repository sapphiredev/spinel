import { bold, hyperlink, hideLinkEmbed } from '@discordjs/builders';
import type { APIInteractionResponse } from 'discord-api-types';
import { DiscordApplicationId } from '../lib/env';
import { interactionResponse } from '../lib/responseHelpers';

export function invite(): APIInteractionResponse {
	return interactionResponse({
		content: `Add the Sapphire interaction to your server: ${hyperlink(
			bold('click here'),
			hideLinkEmbed(`https://discord.com/api/oauth2/authorize?client_id=${DiscordApplicationId}&scope=applications.commands`)
		)}`,
		ephemeral: true
	});
}

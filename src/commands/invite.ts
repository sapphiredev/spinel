import { bold, hideLinkEmbed, hyperlink } from '@discordjs/builders';
import type { APIInteractionResponseChannelMessageWithSource } from 'discord-api-types/v9';
import { DiscordApplicationId } from '../lib/env';
import { interactionResponse } from '../lib/responseHelpers';

export function invite(): APIInteractionResponseChannelMessageWithSource {
	return interactionResponse({
		content: `Add the Sapphire interaction to your server: ${bold(
			hyperlink(
				'click here',
				hideLinkEmbed(`https://discord.com/api/oauth2/authorize?client_id=${DiscordApplicationId}&scope=applications.commands`)
			)
		)}`,
		ephemeral: true
	});
}

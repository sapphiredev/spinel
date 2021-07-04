import type { APIInteractionResponse } from 'discord-api-types';
import { interactionResponse } from '../lib/responseHelpers';
import { ApplicationId } from '../lib/env';

export function invite(): APIInteractionResponse {
	return interactionResponse({
		content: `Add the Sapphire interaction to your server: [(click here)](<https://discord.com/api/oauth2/authorize?client_id=${ApplicationId}&scope=applications.commands>)`,
		ephemeral: true
	});
}

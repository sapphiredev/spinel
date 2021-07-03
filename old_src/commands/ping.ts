import { APIApplicationCommandInteraction, InteractionResponseType, MessageFlags } from 'discord-api-types/v8';
import { createCommandResponse } from '../lib/utils/createCommandResponse';

export function ping(interaction: APIApplicationCommandInteraction) {
	const now = BigInt(Date.now());
	const bigintId = BigInt(interaction.id);

	const pingDelay = Number(now - (bigintId >> 22n) - 1420070400000n);

	return createCommandResponse({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.EPHEMERAL,
			content: `Pong! Took ${pingDelay.toFixed(2)}ms! 🏓`
		}
	});
}

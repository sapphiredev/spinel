import { APIInteractionResponse, InteractionResponseType, MessageFlags } from 'discord-api-types/v8';

export function ping(id: string): APIInteractionResponse {
	const now = BigInt(Date.now());
	const bigintId = BigInt(id);

	const pingDelay = Number(now - (bigintId >> 22n) - 1420070400000n);

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.EPHEMERAL,
			content: `Pong! Took ${pingDelay.toFixed(2)}ms! 🏓`
		}
	};
}

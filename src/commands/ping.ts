import type { APIInteractionResponseChannelMessageWithSource } from 'discord-api-types/v9';
import { interactionResponse } from '../lib/util/responseHelpers';

export function ping(id: string): APIInteractionResponseChannelMessageWithSource {
	const now = BigInt(Date.now());
	const bigintId = BigInt(id);

	const pingDelay = Number(now - (bigintId >> 22n) - 1420070400000n);

	return interactionResponse({
		content: `Pong! Took ${pingDelay.toFixed(2)}ms! 🏓`,
		ephemeral: true
	});
}

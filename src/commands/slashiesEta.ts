import { time, TimestampStyles } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { Time } from '@sapphire/time-utilities';
import type { VercelResponse } from '@vercel/node';
import type { RESTGetAPIChannelMessageResult } from 'discord-api-types/v9';
import { DiscordWebhookDbMessage } from '../lib/env';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';

export async function slashiesEta({ response }: SlashiesEtaParameters): Promise<VercelResponse> {
	try {
		const webhookDbMessage = await fetch<RESTGetAPIChannelMessageResult>(DiscordWebhookDbMessage, FetchResultTypes.JSON);
		const webhookDbMessageParsed = JSON.parse(webhookDbMessage.content) as WebhookDbStructure;
		let { lastEta } = webhookDbMessageParsed;

		const currentEta = time(new Date(lastEta), TimestampStyles.RelativeTime);

		lastEta += Time.Day * 7;

		await fetch(DiscordWebhookDbMessage, {
			method: FetchMethods.Patch,
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				content: `{ "lastEta": ${lastEta} }`
			})
		});

		return response.json(
			interactionResponse({
				content: `Slashies will be releasing ${currentEta}`
			})
		);
	} catch {
		return response.json(errorResponse({ content: 'something went wrong' }));
	}
}

interface SlashiesEtaParameters {
	response: VercelResponse;
}

interface WebhookDbStructure {
	lastEta: number;
}

import { time, TimestampStyles } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { Time } from '@sapphire/time-utilities';
import type { RESTGetAPIChannelMessageResult } from 'discord-api-types/v9';
import { FetchUserAgent } from '../lib/constants/constants';
import type { FastifyResponse } from '../lib/types/Api';
import { DiscordWebhookDbMessage } from '../lib/util/env';
import { errorResponse, interactionResponse, sendJson } from '../lib/util/responseHelpers';

export async function slashiesEta({ response }: SlashiesEtaParameters): Promise<FastifyResponse> {
	try {
		const webhookDbMessage = await fetch<RESTGetAPIChannelMessageResult>(DiscordWebhookDbMessage, FetchResultTypes.JSON);
		const webhookDbMessageParsed = JSON.parse(webhookDbMessage.content) as WebhookDbStructure;
		let { lastEta } = webhookDbMessageParsed;

		const currentEta = time(new Date(lastEta), TimestampStyles.RelativeTime);

		lastEta += Time.Day * 7;

		await fetch(DiscordWebhookDbMessage, {
			method: FetchMethods.Patch,
			headers: {
				'content-type': 'application/json',
				'User-Agent': FetchUserAgent
			},
			body: JSON.stringify({
				content: `{ "lastEta": ${lastEta} }`
			})
		});

		return sendJson(
			response,
			interactionResponse({
				content: `Slashies will be releasing ${currentEta}`
			})
		);
	} catch {
		return sendJson(response, errorResponse({ content: 'something went wrong' }));
	}
}

interface SlashiesEtaParameters {
	response: FastifyResponse;
}

interface WebhookDbStructure {
	lastEta: number;
}

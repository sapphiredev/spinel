import { time, TimestampStyles } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { Time } from '@sapphire/time-utilities';
import type { VercelResponse } from '@vercel/node';
import type { RESTGetAPIChannelMessageResult } from 'discord-api-types/v9';
import { DiscordWebhookDbMessage } from '../lib/env';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';

export async function slashiesEta({ response }: SlashiesEtaParameters): Promise<VercelResponse> {
	try {
		console.log('starting slashiesEta');
		const webhookDbMessage = await fetch<RESTGetAPIChannelMessageResult>(DiscordWebhookDbMessage, FetchResultTypes.JSON);
		console.log('found db message: ', webhookDbMessage);
		const webhookDbMessageParsed = JSON.parse(webhookDbMessage.content) as WebhookDbStructure;
		console.log('parsed content: ', webhookDbMessageParsed);
		let { lastEta } = webhookDbMessageParsed;
		console.log('lastEta: ', lastEta);

		const currentEta = time(new Date(lastEta), TimestampStyles.RelativeTime);
		console.log('parsed currentEta: ', currentEta);

		lastEta += Time.Day * 7;

		console.log('about to update webhook msg');
		await fetch(DiscordWebhookDbMessage, {
			method: FetchMethods.Patch,
			body: JSON.stringify({
				content: `{ "lastEta": ${lastEta} }`
			})
		});

		console.log('sending response');

		return response.json(
			interactionResponse({
				content: `Slashies will be releasing ${currentEta}`
			})
		);
	} catch (error) {
		console.error(error);
		return response.json(errorResponse({ content: 'something went wrong' }));
	}
}

interface SlashiesEtaParameters {
	response: VercelResponse;
}

interface WebhookDbStructure {
	lastEta: number;
}

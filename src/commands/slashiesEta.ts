import { FetchUserAgent } from '#constants/constants';
import { envParseString } from '#env/utils';
import type { FastifyResponse } from '#types/Api';
import { errorResponse, interactionResponse, sendJson } from '#utils/responseHelpers';
import { time, TimestampStyles } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { Time } from '@sapphire/time-utilities';
import type { RESTGetAPIChannelMessageResult } from 'discord-api-types/v9';

export async function slashiesEta({ response }: SlashiesEtaParameters): Promise<FastifyResponse> {
	try {
		const dbMessageUrl = new URL(`${envParseString('DISCORD_WEBHOOK_DB_URL')}/messages/${envParseString('DISCORD_WEBHOOK_DB_MESSAGE_ID')}`);

		const webhookDbMessage = await fetch<RESTGetAPIChannelMessageResult>(dbMessageUrl, FetchResultTypes.JSON);
		const webhookDbMessageParsed = JSON.parse(webhookDbMessage.content) as WebhookDbStructure;
		let { lastEta } = webhookDbMessageParsed;

		const currentEta = time(new Date(lastEta), TimestampStyles.RelativeTime);

		lastEta += Time.Day * 7;

		await fetch(dbMessageUrl, {
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

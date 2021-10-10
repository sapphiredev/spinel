import { fetch, FetchMethods } from '@sapphire/fetch';
import { InteractionResponseType, RouteBases, Routes, Snowflake } from 'discord-api-types/v9';
import type { FastifyResponse } from '../lib/types/Api';
import { fetchDocResult, fetchDocs } from '../lib/util/discordjs-docs';
import { DiscordApplicationId } from '../lib/util/env';
import { interactionResponse, sendJson } from '../lib/util/responseHelpers';

export async function handleDjsDocsSelectMenu({
	response,
	selectedValue,
	target,
	source,
	token
}: HandleDjsDocsSelectMenuParameters): Promise<[PromiseSettledResult<FastifyResponse>, PromiseSettledResult<unknown>]> {
	const doc = await fetchDocs(source);

	return Promise.allSettled([
		sendJson(
			response,
			interactionResponse({
				content: 'Documentation entry sent',
				type: InteractionResponseType.UpdateMessage,
				extraData: {
					components: []
				}
			})
		),
		fetch(`${RouteBases.api}${Routes.webhook(DiscordApplicationId, token)}`, {
			method: FetchMethods.Post,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: fetchDocResult({ source, doc, query: selectedValue, target }),
				allowed_mentions: { users: target ? [target] : [] }
			})
		})
	]);
}

interface HandleDjsDocsSelectMenuParameters {
	response: FastifyResponse;
	source: string;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

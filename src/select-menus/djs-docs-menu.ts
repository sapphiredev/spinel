import { FetchUserAgent } from '#constants/constants';
import { envParseString } from '#env/utils';
import type { FastifyResponse } from '#types/Api';
import { fetchDocResult, fetchDocs } from '#utils/discordjs-docs';
import { interactionResponse, sendJson } from '#utils/responseHelpers';
import { fetch, FetchMethods } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import { InteractionResponseType, RouteBases, Routes } from 'discord-api-types/v9';
import type { SourcesStringUnion } from 'discordjs-docs-parser';

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
		fetch(`${RouteBases.api}${Routes.webhook(envParseString('DISCORD_APPLICATION_ID'), token)}`, {
			method: FetchMethods.Post,
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': FetchUserAgent
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
	source: SourcesStringUnion;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

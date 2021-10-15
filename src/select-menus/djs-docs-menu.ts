import { fetch, FetchMethods } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import { InteractionResponseType, RouteBases, Routes, Snowflake } from 'discord-api-types/v9';
import { fetchDocResult, fetchDocs } from '../lib/util/discordjs-docs';
import { DiscordApplicationId } from '../lib/util/env';
import { interactionResponse } from '../lib/util/responseHelpers';

export async function handleDjsDocsSelectMenu({
	response,
	selectedValue,
	target,
	source,
	token
}: HandleDjsDocsSelectMenuParameters): Promise<[PromiseSettledResult<VercelResponse>, PromiseSettledResult<unknown>] | undefined> {
	const doc = await fetchDocs(source);

	try {
		const promiseResponse = await Promise.allSettled([
			response.json(
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
					'Content-Type': 'application/json',
					'User-Agent': 'SapphireApplicationCommands/1.0.0 (Linux; x64)'
				},
				body: JSON.stringify({
					content: fetchDocResult({ source, doc, query: selectedValue, target }),
					allowed_mentions: { users: target ? [target] : [] }
				})
			})
		]);

		console.log('SUCCESSFUL FETCH!');
		console.log(promiseResponse);
		return promiseResponse;
	} catch (error) {
		console.error('FAILED FETCH!');
		console.error(error);
		return undefined;
	}
}

interface HandleDjsDocsSelectMenuParameters {
	response: VercelResponse;
	source: string;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

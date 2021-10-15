import { fetch, FetchMethods } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import { InteractionResponseType, RouteBases, Routes, Snowflake } from 'discord-api-types/v9';
import { DiscordApplicationId } from '../lib/util/env';
import { interactionResponse } from '../lib/util/responseHelpers';
import { findTag } from '../lib/util/tags';

export async function handleTagSelectMenu({
	response,
	selectedValue,
	target,
	token
}: HandleTagSelectMenuParameters): Promise<[PromiseSettledResult<VercelResponse>, PromiseSettledResult<unknown>] | undefined> {
	try {
		const promiseResponse = await Promise.allSettled([
			response.json(
				interactionResponse({
					content: 'Tag sent',
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
					content: findTag(selectedValue, target),
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

interface HandleTagSelectMenuParameters {
	response: VercelResponse;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

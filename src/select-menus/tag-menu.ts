import { FetchUserAgent } from '#constants/constants';
import { envParseString } from '#env/utils';
import type { FastifyResponse } from '#types/Api';
import { interactionResponse, sendJson } from '#utils/responseHelpers';
import { findTag } from '#utils/tags';
import { fetch, FetchMethods } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import { InteractionResponseType, RouteBases, Routes } from 'discord-api-types/v9';

export async function handleTagSelectMenu({
	response,
	selectedValue,
	target,
	token
}: HandleTagSelectMenuParameters): Promise<[PromiseSettledResult<FastifyResponse>, PromiseSettledResult<unknown>]> {
	return Promise.allSettled([
		sendJson(
			response,
			interactionResponse({
				content: 'Tag sent',
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
				content: findTag(selectedValue, target),
				allowed_mentions: { users: target ? [target] : [] }
			})
		})
	]);
}

interface HandleTagSelectMenuParameters {
	response: FastifyResponse;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

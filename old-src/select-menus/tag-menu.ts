import { FetchUserAgent } from '#constants/constants';
import { envParseString } from '#env/utils';
import type { FastifyResponse } from '#types/Api';
import { sendJson, updateResponse } from '#utils/responseHelpers';
import { findTag } from '#utils/tags';
import { fetch, FetchMethods } from '@sapphire/fetch';
import { RouteBases, Routes, type Snowflake } from 'discord-api-types/v9';

export async function handleTagSelectMenu({
	response,
	selectedValue,
	target,
	token
}: HandleTagSelectMenuParameters): Promise<[PromiseSettledResult<FastifyResponse>, PromiseSettledResult<unknown>]> {
	return Promise.allSettled([
		sendJson(
			response,
			updateResponse({
				content: 'Tag sent',
				extraData: {
					components: []
				}
			})
		),
		fetch(`${RouteBases.api}${Routes.webhook(envParseString('DISCORD_CLIENT_ID'), token)}`, {
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

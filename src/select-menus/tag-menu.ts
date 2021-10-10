import { fetch, FetchMethods } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import { Routes, InteractionResponseType, RouteBases, Snowflake } from 'discord-api-types/v9';
import { DiscordApplicationId } from '../lib/util/env';
import { interactionResponse } from '../lib/util/responseHelpers';
import { findTag } from '../lib/util/tags';

export async function handleTagSelectMenu({ response, selectedValue, target, token }: HandleTagSelectMenuParameters): Promise<void> {
	response
		.json(
			interactionResponse({
				content: 'Suggestion sent',
				type: InteractionResponseType.UpdateMessage
			})
		)
		.end();

	await fetch(`${RouteBases.api}/${Routes.webhook(DiscordApplicationId, token)}}`, {
		method: FetchMethods.Post,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			content: findTag(selectedValue, target),
			allowed_mentions: { users: target ? [target] : [] }
		})
	});
}

interface HandleTagSelectMenuParameters {
	response: VercelResponse;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

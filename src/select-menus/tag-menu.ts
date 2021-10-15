import { fetch, FetchMethods } from '@sapphire/fetch';
import { RouteBases, Routes, Snowflake } from 'discord-api-types/v9';
import { DiscordApplicationId } from '../lib/util/env';
import { findTag } from '../lib/util/tags';

export async function handleTagSelectMenu({ selectedValue, target, token }: HandleTagSelectMenuParameters): Promise<void> {
	try {
		await fetch(`${RouteBases.api}${Routes.webhook(DiscordApplicationId, token)}}`, {
			method: FetchMethods.Post,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: findTag(selectedValue, target),
				allowed_mentions: { users: target ? [target] : [] }
			})
		});
	} catch (error) {}
}

interface HandleTagSelectMenuParameters {
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

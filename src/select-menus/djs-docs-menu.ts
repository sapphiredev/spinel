import { fetch, FetchMethods } from '@sapphire/fetch';
import { RouteBases, Routes, Snowflake } from 'discord-api-types/v9';
import { fetchDocResult, fetchDocs } from '../lib/util/discordjs-docs';
import { DiscordApplicationId } from '../lib/util/env';

export async function handleDjsDocsSelectMenu({ selectedValue, target, source, token }: HandleDjsDocsSelectMenuParameters): Promise<void> {
	const doc = await fetchDocs(source);

	await fetch(`${RouteBases.api}${Routes.webhook(DiscordApplicationId, token)}}`, {
		method: FetchMethods.Post,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			content: fetchDocResult({ source, doc, query: selectedValue, target }),
			allowed_mentions: { users: target ? [target] : [] }
		})
	});
}

interface HandleDjsDocsSelectMenuParameters {
	source: string;
	token: string;
	selectedValue: string;
	target?: Snowflake;
}

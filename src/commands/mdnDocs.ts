import { bold, hideLinkEmbed, hyperlink, italic, underscore } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import { AllowedMentionsTypes, Snowflake } from 'discord-api-types/v9';
import { encode } from 'querystring';
import { MdnUrl } from '../lib/constants';
import { MdnIcon } from '../lib/emotes';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';

const cache = new Map<string, Document>();

export async function mdnSearch({ response, query, target }: MdnSearchParameters): Promise<VercelResponse> {
	try {
		const qString = `${MdnUrl}/api/v1/search?${encode({ q: query })}`;
		let hit = cache.get(qString);
		if (!hit) {
			const result = await fetch<MdnAPI>(qString, FetchResultTypes.JSON);
			hit = result.documents?.[0];
			cache.set(qString, hit);
		}

		if (!hit) {
			return response.json(
				errorResponse({
					content: `there were no search results for the query \`${query}\``
				})
			);
		}

		const url = MdnUrl + hit.mdn_url;

		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;
		const intro = hit.summary //
			.replace(/\s+/g, ' ') //
			.replace(linkReplaceRegex, hyperlink('$1', hideLinkEmbed(`${MdnUrl}$2`))) //
			.replace(boldCodeBlockRegex, bold('`$1`'));

		const parts = [`${MdnIcon} \ ${underscore(hyperlink(bold(hit.title), hideLinkEmbed(url)))}`, intro];

		return response.json(
			interactionResponse({
				content: `${target ? `${italic(`Documentation suggestion for <@${target}>:`)}\n` : ''}${parts.join('\n')}`,
				users: target ? [target] : [],
				parse: target ? [AllowedMentionsTypes.User] : []
			})
		);
	} catch {
		return response.json(errorResponse({ content: 'something went wrong' }));
	}
}

interface MdnSearchParameters {
	response: VercelResponse;
	query: string;
	target: Snowflake;
}

interface MdnAPI {
	documents: Document[];
	metadata: Metadata;
	suggestions: any[];
}

interface Document {
	mdn_url: string;
	score: number;
	title: string;
	locale: string;
	slug: string;
	popularity: number;
	archived: boolean;
	summary: string;
	highlight: Highlight;
}

interface Highlight {
	body: string[];
	title: string[];
}

interface Metadata {
	took_ms: number;
	total: Total;
	size: number;
	page: number;
}

interface Total {
	value: number;
	relation: string;
}

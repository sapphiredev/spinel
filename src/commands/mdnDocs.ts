import { bold, hideLinkEmbed, hyperlink, italic, underscore, userMention } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { Snowflake } from 'discord-api-types/v9';
import { encode } from 'querystring';
import { MdnUrl } from '../lib/constants/constants';
import { MdnIcon } from '../lib/constants/emotes';
import type { FastifyResponse } from '../lib/types/Api';
import { errorResponse, interactionResponse, sendJson } from '../lib/util/responseHelpers';

const cache = new Map<string, Document>();

export async function mdnSearch({ response, query, target }: MdnSearchParameters): Promise<FastifyResponse> {
	try {
		const qString = `${MdnUrl}/api/v1/search?${encode({ q: query })}`;
		let hit = cache.get(qString);
		if (!hit) {
			const result = await fetch<MdnAPI>(qString, FetchResultTypes.JSON);
			hit = result.documents?.[0];

			if (hit) {
				cache.set(qString, hit);
			}
		}

		if (!hit) {
			return sendJson(
				response,
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

		const parts = [`${MdnIcon} \ ${underscore(bold(hyperlink(hit.title, hideLinkEmbed(url))))}`, intro];

		return sendJson(
			response,
			interactionResponse({
				content: `${target ? `${italic(`Documentation suggestion for ${userMention(target)}:`)}\n` : ''}${parts.join('\n')}`,
				users: target ? [target] : []
			})
		);
	} catch {
		return sendJson(response, errorResponse({ content: 'something went wrong' }));
	}
}

interface MdnSearchParameters {
	response: FastifyResponse;
	query: string;
	target: Snowflake;
}

interface MdnAPI {
	documents?: Document[];
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

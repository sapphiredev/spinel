import { bold, hideLinkEmbed, hyperlink, italic, underscore } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import { AllowedMentionsTypes, Snowflake } from 'discord-api-types/v9';
import TurndownService from 'turndown';
import { NodeUrl } from '../lib/constants';
import { NodeIcon } from '../lib/emotes';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';
import type { NodeDocs } from '../lib/types/NodeDocs';

const td = new TurndownService({ codeBlockStyle: 'fenced' });

type QueryType = 'method' | 'class' | 'event' | 'classMethod' | 'module';

function findRec(o: any, name: string, type: QueryType, module?: string): any {
	name = name.toLowerCase();
	if (!module) module = o?.type === 'module' ? o?.name.toLowerCase() : undefined;
	if (o?.name?.toLowerCase() === name.toLowerCase() && o?.type === type) {
		o.module = module;
		return o;
	}
	for (const prop of Object.keys(o)) {
		if (Array.isArray(o[prop])) {
			for (const entry of o[prop]) {
				const res = findRec(entry, name, type, module);
				if (res) {
					o.module = module;
					return res;
				}
			}
		}
	}
}

function anchor(text: string, module: string): string {
	const method = text
		.toLowerCase()
		.replace(/ |`|\[|\]|\)/g, '')
		.replace(/\.|\(|,|:/g, '_');
	return `${module}_${method}`;
}

const cache: Map<string, NodeDocs> = new Map();

export async function nodeSearch({ response, query, version, target }: NodeSearchParameters): Promise<VercelResponse> {
	try {
		const url = `${NodeUrl}/dist/${version}/docs/api/all.json`;
		let allNodeData = cache.get(url);

		if (!allNodeData) {
			// Get the data for this version
			const data = await fetch<NodeDocs>(url, FetchResultTypes.JSON);

			// Set it to the map for caching
			cache.set(url, data);

			// Set the local parameter for further processing
			allNodeData = data;
		}

		const queryParts = query.split(/#|\.|\s/);
		const altQuery = queryParts[queryParts.length - 1];

		const result =
			findRec(allNodeData, query, 'class') ??
			findRec(allNodeData, query, 'classMethod') ??
			findRec(allNodeData, query, 'method') ??
			findRec(allNodeData, query, 'event') ??
			findRec(allNodeData, altQuery, 'class') ??
			findRec(allNodeData, altQuery, 'method') ??
			findRec(allNodeData, altQuery, 'event') ??
			findRec(allNodeData, altQuery, 'classMethod') ??
			findRec(allNodeData, query, 'module') ??
			findRec(allNodeData, altQuery, 'module');

		if (!result) {
			return response.json(
				errorResponse({
					content: `there were no search results for the query \`${query}\``
				})
			);
		}

		const moduleURL = `${NodeUrl}/docs/${version}/api/${result.module as string}`;
		const fullURL = `${moduleURL}.html${result.type === 'module' ? '' : `#${anchor(result.textRaw, result.module)}`}`;
		const parts = [`${NodeIcon} \ ${underscore(hyperlink(bold(result.textRaw as string), hideLinkEmbed(fullURL)))}`];

		const intro = td.turndown(result.desc ?? 'no intro').split('\n\n')[0];

		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;
		parts.push(
			intro
				.replace(linkReplaceRegex, hyperlink('$1', hideLinkEmbed(`${NodeUrl}/$2`))) //
				.replace(boldCodeBlockRegex, bold('`$1`')) //
		);

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

interface NodeSearchParameters {
	response: VercelResponse;
	query: string;
	version: 'latest-v12.x' | 'latest-v14.x' | 'latest-v16.x';
	target: Snowflake;
}

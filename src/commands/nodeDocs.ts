import { bold, italic, underscore, hyperlink, hideLinkEmbed } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { VercelResponse } from '@vercel/node';
import type { Snowflake } from 'discord-api-types/v9';
import TurndownService from 'turndown';
import { NodeUrl } from '../lib/constants';
import { NodeIcon } from '../lib/emotes';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';
import type { NodeDocs } from '../lib/types/NodeDocs';

const td = new TurndownService({ codeBlockStyle: 'fenced' });

type QueryType = 'class' | 'classMethod' | 'method' | 'event' | 'module' | 'global' | 'misc';

function urlReplacer(_: string, label: string, link: string, version: string) {
	link = link.startsWith('http') ? link : `${NodeUrl}/docs/${version}/api/${link}`;
	return `[${label}](<${link}>)`;
}

function findRec(o: any, name: string, type: QueryType, module?: string, source?: string): any {
	name = name.toLowerCase();
	if (!module) module = o?.type === 'module' ? o?.name.toLowerCase() : undefined;
	if (o?.name?.toLowerCase() === name && o?.type === type) {
		o.module = module;
		return o;
	}
	o._source = source;
	for (const prop of Object.keys(o)) {
		if (Array.isArray(o[prop])) {
			for (const entry of o[prop]) {
				const res = findRec(entry, name, type, module, o.source ?? o._source);
				if (res) {
					o.module = module;
					return res;
				}
			}
		}
	}
}

function formatForURL(text: string): string {
	return text
		.toLowerCase()
		.replace(/ |`|\[|\]|\)/g, '')
		.replace(/\.|\(|,|:/g, '_');
}

function formatAnchor(text: string, module: string): string {
	return `#${formatForURL(module)}_${formatForURL(text)}`;
}

function parseNameFromSource(source?: string): string | null {
	if (!source) return null;
	const reg = /.+\/api\/(.+)\..*/g;
	const match = reg.exec(source);
	return match?.[1] ?? null;
}

function findResult(data: NodeDocs, query: string) {
	for (const category of ['class', 'classMethod', 'method', 'event', 'module', 'global', 'misc'] as QueryType[]) {
		const res = findRec(data, query, category);
		if (res) {
			return res;
		}
	}
}

const cache: Map<string, NodeDocs> = new Map();

export async function nodeSearch({ response, query, version = 'latest-v16.x', target }: NodeSearchParameters): Promise<VercelResponse> {
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
		const result = findResult(allNodeData, query) ?? findResult(allNodeData, altQuery);

		if (!result) {
			return response.json(
				errorResponse({
					content: `there were no search results for the query \`${query}\``
				})
			);
		}

		const moduleName = result.module ?? result.name.toLowerCase();
		const moduleUrl = `${NodeUrl}/docs/${version}/api/${
			parseNameFromSource(result.source ?? result._source) ?? formatForURL(moduleName as string)
		}`;
		const anchor = ['module', 'misc'].includes(result.type) ? '' : formatAnchor(result.textRaw, moduleName as string);
		const fullUrl = `${moduleUrl}.html${anchor}`;
		const parts = [`${NodeIcon} \ ${hyperlink(underscore(bold(result.textRaw as string)), hideLinkEmbed(fullUrl))}`];

		const intro = td.turndown(result.desc ?? '').split('\n\n')[0];
		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

		parts.push(
			intro
				.replace(linkReplaceRegex, (_, label, link) => urlReplacer(_, label, link, version)) //
				.replace(boldCodeBlockRegex, bold('`$1`')) //
		);

		return response.json(
			interactionResponse({
				content: `${target ? `${italic(`Documentation suggestion for <@${target}>:`)}\n` : ''}${parts.join('\n')}`,
				users: target ? [target] : []
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

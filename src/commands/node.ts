import { FetchUserAgent } from '#constants/constants';
import { NodeIcon } from '#constants/emotes';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { NodeDocs, NodeDocSimilarityEntry, NodeDocTypes, NodeQueryType } from '#types/NodeDocs';
import { errorResponse } from '#utils/response-utils';
import { redisCache } from '#utils/setup';
import { getGuildIds } from '#utils/utils';
import { bold, hideLinkEmbed, hyperlink, inlineCode, italic, underscore, userMention } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { cutText, isNullishOrEmpty } from '@sapphire/utilities';
import { AutocompleteInteractionArguments, Command, RegisterCommand, RestrictGuildIds, type TransformedArguments } from '@skyra/http-framework';
import { jaroWinkler } from '@skyra/jaro-winkler';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import TurndownService from 'turndown';

@RegisterCommand((builder) =>
	builder //
		.setName('node')
		.setDescription('Search the Node.js documentation')
		.addStringOption((builder) =>
			builder //
				.setName('query')
				.setDescription('The phrase to search for')
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addStringOption((builder) =>
			builder //
				.setName('version')
				.setDescription('Which version of Node.js do you want to search?')
				.addChoices(
					{ name: 'Node.js 12', value: 'latest-v12.x' },
					{ name: 'Node.js 14', value: 'latest-v14.x' },
					{ name: 'Node.js 16 (default)', value: 'latest-v16.x' },
					{ name: 'Node.js 17', value: 'latest-v17.x' }
				)
		)
		.addUserOption((builder) =>
			builder //
				.setName('target')
				.setDescription('Who should I ping that should look at these results?')
		)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	#nodeUrl = 'https://nodejs.org' as const;
	#td = new TurndownService({ codeBlockStyle: 'fenced' });
	#cache = new Map<string, NodeDocs>();

	public override async autocompleteRun(_: never, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'query' || isNullishOrEmpty(args.query)) {
			return this.autocompleteNoResults();
		}

		args.version ??= 'latest-v16.x';

		const allNodeData = await this.getNodeDocsForVersion(args.version);

		const queryParts = args.query.split(/#|\.|\s/);
		const altQuery = queryParts[queryParts.length - 1];

		const fuzzyResults: NodeDocSimilarityEntry[] = [];

		for (const types of Object.values(allNodeData) as NodeDocs[keyof NodeDocs][]) {
			const resultsFromQueryType: NodeDocSimilarityEntry[] = [];

			for (const typeItem of types) {
				const distanceWithQuery = jaroWinkler(typeItem.name, args.query);
				const distanceWithAltQuery = jaroWinkler(typeItem.name, altQuery);

				resultsFromQueryType.push({
					name: typeItem.name,
					distance: Math.max(distanceWithQuery, distanceWithAltQuery),
					entry: typeItem
				});
			}

			fuzzyResults.push(...resultsFromQueryType);
		}

		if (!fuzzyResults.length) {
			return this.autocompleteNoResults();
		}

		const sortedFuzzyResults = fuzzyResults.sort((a, b) => b.distance - a.distance);

		const redisInsertPromises: Promise<'OK'>[] = [];
		const results: APIApplicationCommandOptionChoice[] = [];

		for (const [index, similarityEntry] of sortedFuzzyResults.entries()) {
			redisInsertPromises.push(
				redisCache.insertFor60Seconds<NodeDocTypes>(RedisKeys.Node, args.query, index.toString(), similarityEntry.entry)
			);

			results.push({
				name: cutText(similarityEntry.name.replace(/`/g, ''), 100),
				value: `${RedisKeys.Node}:${args.query}:${index}`
			});
		}

		if (redisInsertPromises.length) {
			await Promise.all(redisInsertPromises);
		}

		return this.autocomplete({
			choices: results.slice(0, 19)
		});
	}

	public override async chatInputRun(_: never, { query, version = 'latest-v16.x', target }: Args) {
		const [, queryFromAutocomplete, nthResult] = query.split(':');

		const hitFromRedisCache = await redisCache.fetch<NodeDocTypes>(RedisKeys.Node, queryFromAutocomplete, nthResult);

		if (hitFromRedisCache) {
			return this.buildResponse(hitFromRedisCache, version, target);
		}

		const nodeDocs = await this.getNodeDocsForVersion(version);

		const queryParts = (queryFromAutocomplete ?? query).split(/#|\.|\s/);
		const altQuery = queryParts[queryParts.length - 1];

		const result = this.findResult(nodeDocs, queryFromAutocomplete ?? query) ?? this.findResult(nodeDocs, altQuery);

		if (!result) {
			return this.message(
				errorResponse({
					content: `no results were found for ${inlineCode(queryFromAutocomplete ?? query)}`,
					allowed_mentions: {
						users: target?.user.id ? [target?.user.id] : []
					}
				})
			);
		}

		return this.buildResponse(result, version, target);
	}

	private async getNodeDocsForVersion(version: Args['version']): Promise<NodeDocs> {
		const url = `${this.#nodeUrl}/dist/${version}/docs/api/all.json`;
		let allNodeData = this.#cache.get(url);

		if (!allNodeData) {
			// Get the data for this version
			const data = await fetch<NodeDocs>(
				url,
				{
					headers: {
						'User-Agent': FetchUserAgent
					}
				},
				FetchResultTypes.JSON
			);

			// Set it to the map for caching
			this.#cache.set(url, data);

			// Set the local parameter for further processing
			allNodeData = data;
		}

		return allNodeData;
	}

	private urlReplacer(_: string, label: string, link: string, version: string) {
		link = link.startsWith('http') ? link : `${this.#nodeUrl}/docs/${version}/api/${link}`;
		return hyperlink(label, hideLinkEmbed(link));
	}

	private findRec(o: any, name: string, type: NodeQueryType, module?: string, source?: string): any {
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
					const res = this.findRec(entry, name, type, module, o.source ?? o._source);
					if (res) {
						o.module = module;
						return res;
					}
				}
			}
		}
	}

	private formatForURL(text: string): string {
		return text
			.toLowerCase()
			.replace(/ |`|\[|\]|\(|\)/g, '')
			.replace(/\.+|\(|,|:/g, '-')
			.replace(/-{2,}/g, '-');
	}

	private formatAnchor(text: string): string {
		return `#${this.formatForURL(text)}`;
	}

	private parseNameFromSource(source?: string): string | null {
		if (!source) return null;
		const reg = /.+\/api\/(.+)\..*/g;
		const match = reg.exec(source);
		return match?.[1] ?? null;
	}

	private findResult(data: NodeDocs, query: string) {
		for (const category of ['class', 'classMethod', 'method', 'event', 'module', 'global', 'misc'] as NodeQueryType[]) {
			const res = this.findRec(data, query, category);

			if (res) {
				return res;
			}
		}
	}

	private buildResponse(result: NodeDocTypes, version: Args['version'], target?: TransformedArguments.User): Command.Response {
		const moduleName = result.module ?? result.name.toLowerCase();

		const moduleUrl = `${this.#nodeUrl}/docs/${version}/api/${
			this.parseNameFromSource(result.source ?? result._source) ?? this.formatForURL(moduleName as string)
		}`;

		const anchor = ['module', 'misc'].includes(result.type) ? '' : this.formatAnchor(result.textRaw);
		const fullUrl = `${moduleUrl}.html${anchor}`;
		const parts = [`${NodeIcon} \ ${underscore(bold(hyperlink(result.textRaw as string, hideLinkEmbed(fullUrl))))}`];

		const intro = this.#td.turndown(result.desc ?? '').split('\n\n')[0];
		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

		parts.push(
			intro
				.replace(linkReplaceRegex, (_, label, link) => this.urlReplacer(_, label, link, version)) //
				.replace(boldCodeBlockRegex, bold('`$1`')) //
		);

		return this.message({
			content: `${target?.user.id ? `${italic(`Documentation suggestion for ${userMention(target.user.id)}:`)}\n` : ''}${parts.join('\n')}`,
			allowed_mentions: {
				users: target?.user.id ? [target?.user.id] : []
			}
		});
	}
}

interface Args {
	query: string;
	version: 'latest-v12.x' | 'latest-v14.x' | 'latest-v16.x' | 'latest-v17.x';
	target?: TransformedArguments.User;
}

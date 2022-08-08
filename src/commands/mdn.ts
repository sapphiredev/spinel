import { FetchUserAgent } from '#constants/constants';
import { MdnIcon } from '#constants/emotes';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { MdnAPI, MdnDocument } from '#types/Mdn';
import { errorResponse } from '#utils/response-utils';
import { getGuildIds } from '#utils/utils';
import { bold, hideLinkEmbed, hyperlink, inlineCode, italic, underscore, userMention } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { cutText, isNullishOrEmpty } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds, type AutocompleteInteractionArguments, type TransformedArguments } from '@skyra/http-framework';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import { URL } from 'node:url';

@RegisterCommand((builder) =>
	builder //
		.setName('mdn')
		.setDescription('Search the Mozilla Developer Network documentation')
		.addStringOption((builder) =>
			builder //
				.setName('query')
				.setDescription('The phrase to search for')
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addUserOption((builder) =>
			builder //
				.setName('target')
				.setDescription('Who should I ping that should look at these results?')
		)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	#mdnUrl = `https://developer.mozilla.org` as const;

	public override async autocompleteRun(_: never, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'query' || isNullishOrEmpty(args.query)) {
			return this.autocompleteNoResults();
		}

		const mdnResponse = await this.fetchApi(args.query);

		const redisInsertPromises: Promise<'OK'>[] = [];
		const results: APIApplicationCommandOptionChoice[] = [];

		for (const [index, hit] of mdnResponse.documents?.entries() ?? []) {
			redisInsertPromises.push(this.container.redisClient.insertFor60Seconds<MdnDocument>(RedisKeys.Mdn, args.query, index.toString(), hit));

			results.push({
				name: cutText(hit.title, 100),
				value: `${RedisKeys.Mdn}:${args.query}:${index}`
			});
		}

		if (redisInsertPromises.length) {
			await Promise.all(redisInsertPromises);
		}

		return this.autocomplete({
			choices: results.slice(0, 19)
		});
	}

	public override async chatInputRun(_: never, { query, target }: Args) {
		const [, queryFromAutocomplete, nthResult] = query.split(':');
		const hitFromRedisCache = await this.container.redisClient.fetch<MdnDocument>(RedisKeys.Mdn, queryFromAutocomplete, nthResult);

		if (hitFromRedisCache) {
			return this.buildResponse(hitFromRedisCache, target);
		}

		const mdnResponse = await this.fetchApi(queryFromAutocomplete ?? query, 1);

		if (!mdnResponse.documents?.[0]) {
			return this.message(
				errorResponse({
					content: `no results were found for ${inlineCode(queryFromAutocomplete ?? query)}`
				})
			);
		}

		return this.buildResponse(mdnResponse.documents[0]);
	}

	private async fetchApi(query: string, hitsPerPage = 25) {
		const fullUrl = new URL(`${this.#mdnUrl}/api/v1/search`);
		fullUrl.searchParams.append('q', query);
		fullUrl.searchParams.append('size', hitsPerPage.toString());

		return fetch<MdnAPI>(
			fullUrl,
			{
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': FetchUserAgent
				}
			},
			FetchResultTypes.JSON
		);
	}

	private buildResponse(mdnDocument: MdnDocument, target?: TransformedArguments.User): Command.Response {
		const url = this.#mdnUrl + mdnDocument.mdn_url;

		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;
		const intro = mdnDocument.summary //
			.replace(/\s+/g, ' ') //
			.replace(linkReplaceRegex, hyperlink('$1', hideLinkEmbed(`${this.#mdnUrl}$2`))) //
			.replace(boldCodeBlockRegex, bold('`$1`'));

		const parts = [`${MdnIcon} \ ${underscore(bold(hyperlink(mdnDocument.title, hideLinkEmbed(url))))}`, intro];

		return this.message({
			content: `${target?.user.id ? `${italic(`Documentation suggestion for ${userMention(target.user.id)}:`)}\n` : ''}${parts.join('\n')}`,
			allowed_mentions: {
				users: target?.user.id ? [target.user.id] : []
			}
		});
	}
}

interface Args {
	query: string;
	target?: TransformedArguments.User;
}

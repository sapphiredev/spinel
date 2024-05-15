import { FetchUserAgent } from '#constants/constants';
import { GreenTick } from '#constants/emotes';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { AlgoliaSearchResult, NpmPackageAuthor, NpmSearchHit } from '#types/Algolia.js';
import { errorResponse } from '#utils/response-utils';
import { getGuildIds } from '#utils/utils';
import {
	EmbedBuilder,
	HeadingLevel,
	TimestampStyles,
	bold,
	heading,
	hideLinkEmbed,
	hyperlink,
	inlineCode,
	italic,
	time,
	underscore,
	userMention
} from '@discordjs/builders';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import { cutText, filterNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import {
	Command,
	RegisterCommand,
	RestrictGuildIds,
	type AutocompleteInteractionArguments,
	type MessageResponseOptions,
	type TransformedArguments
} from '@skyra/http-framework';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import he from 'he';

@RegisterCommand(
	(
		builder //
	) =>
		builder
			.setName('npm')
			.setDescription('Search the NPM registry for a package.')
			.addStringOption((builder) =>
				builder //
					.setName('package')
					.setDescription('The package to search for')
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
	#npmSearchUrl = `https://${envParseString('NPM_ALGOLIA_APPLICATION_ID')}-dsn.algolia.net/1/indexes/npm-search/query` as const;
	#andListFormatter = new Intl.ListFormat(this.name, { type: 'conjunction' });

	public override async autocompleteRun(interaction: Command.AutocompleteInteraction, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'package' || isNullishOrEmpty(args.package)) {
			return interaction.replyEmpty();
		}

		const npmResponse = await this.fetchApi(args.package);

		const redisInsertPromises: Promise<'OK'>[] = [];
		const results: APIApplicationCommandOptionChoice[] = [];

		for (const [index, hit] of npmResponse.hits?.entries() ?? []) {
			redisInsertPromises.push(this.container.redisClient.insertFor60Seconds<NpmSearchHit>(RedisKeys.Npm, args.package, index.toString(), hit));

			results.push({
				name: cutText(hit.name, 100),
				value: `${RedisKeys.Npm}:${args.package}:${index}`
			});
		}

		if (redisInsertPromises.length) {
			await Promise.all(redisInsertPromises);
		}

		return interaction.reply({
			choices: results.slice(0, 19)
		});
	}

	public override async chatInputRun(interaction: Command.Interaction, { package: pkg, target }: Args) {
		const [, packageFromAutocomplete, nthResult] = pkg.split(':');
		const hitFromRedisCache = await this.container.redisClient.fetch<NpmSearchHit>(RedisKeys.Npm, packageFromAutocomplete, nthResult);

		if (hitFromRedisCache) {
			const responseData = this.buildResponse(hitFromRedisCache, target);
			return interaction.reply(responseData);
		}

		const npmResponse = await this.fetchApi(packageFromAutocomplete ?? pkg, 1);

		if (!npmResponse.hits?.[0]) {
			return interaction.reply(
				errorResponse({
					content: `no results were found for ${inlineCode(packageFromAutocomplete ?? pkg)}`
				})
			);
		}

		const responseData = this.buildResponse(npmResponse.hits[0]);
		return interaction.reply(responseData);
	}

	private async fetchApi(pkg: string, hitsPerPage = 25) {
		return fetch<AlgoliaSearchResult<'npm'>>(
			this.#npmSearchUrl,
			{
				method: FetchMethods.Post,
				body: JSON.stringify({
					params: new URLSearchParams({
						query: pkg,
						hitsPerPage: hitsPerPage.toString()
					}).toString()
				}),
				headers: {
					'Content-Type': 'application/json',
					'X-Algolia-API-Key': envParseString('NPM_ALOGLIA_APPLICATION_KEY'),
					'X-Algolia-Application-Id': envParseString('NPM_ALGOLIA_APPLICATION_ID'),
					'User-Agent': FetchUserAgent
				}
			},
			FetchResultTypes.JSON
		);
	}

	private buildResponse(hit: NpmSearchHit, target?: TransformedArguments.User): MessageResponseOptions {
		const maintainers = hit.owners.map((user) => hyperlink(user.name, hideLinkEmbed(user.link)));
		const dependenciesKeys = Object.keys(hit.dependencies);
		const dependencies = dependenciesKeys.length ? this.trimArray(dependenciesKeys) : null;
		const author = this.parseAuthor(hit.owner);
		const dateCreated = hit.created ? time(new Date(hit.created), TimestampStyles.ShortDate) : 'unknown';
		const dateModified = hit.modified ? time(new Date(hit.modified), TimestampStyles.ShortDate) : 'unknown';
		const description = he.decode(cutText(hit.description ?? '', 1000));
		const license = hit.license || 'None';

		const embed = new EmbedBuilder()
			.setTitle(hit.name)
			.setURL(`https://www.npmjs.com/package/${hit.name}`)
			.setColor(0xcc3534)
			.setDescription(
				cutText(
					[
						description,
						'',
						author ? `❯ Author: ${author}` : undefined,
						`❯ Maintainers: ${bold(this.formatListWithAnd(maintainers))}`,
						`❯ Latest version: ${bold(hit.version)}`,
						`❯ License: ${bold(license)}`,
						`❯ Date Created: ${bold(dateCreated)}`,
						`❯ Date Modified: ${bold(dateModified)}`,
						hit.isDeprecated ? `❯ Deprecation Notice: ${bold(hit.isDeprecated.toString())}` : undefined,
						'',
						underscore(italic('Dependencies:')),
						dependencies?.length ? this.formatListWithAnd(dependencies) : `No dependencies ${GreenTick}`
					]
						.filter(filterNullish)
						.join('\n'),
					2000
				)
			);

		return {
			content: target?.user.id ? heading(italic(`Package suggestion for ${userMention(target.user.id)}`), HeadingLevel.Three) : undefined,
			embeds: [embed.toJSON()],
			allowed_mentions: {
				users: target?.user.id ? [target.user.id] : []
			}
		};
	}

	private formatListWithAnd(list: string[]) {
		return this.#andListFormatter.format(list);
	}

	/**
	 * Trims an array to the first 10 entries of that array (indices 0-9) and adds a 10th index containing a count of extra entries
	 * @remark If the array has a length of less than 10 it is returned directly
	 * @param arr The array to trim
	 */
	private trimArray(arr: string[]) {
		if (arr.length > 10) {
			const len = arr.length - 10;
			arr = arr.slice(0, 10);
			arr.push(`${len} more...`);
		}

		return arr;
	}

	/**
	 * Parses an NPM author into a markdown-linked string
	 * @param author The author to parse
	 * @returns Markdown-linked string or undefined (if no author exists)
	 */
	private parseAuthor(author?: NpmPackageAuthor): string | undefined {
		// If there is no author then return undefined
		if (!author) return undefined;

		// Parse the author url
		const authorUrl = author.name.startsWith('@')
			? // If the author is an organization then use the Organization url
				encodeURI(author.link ?? `https://www.npmjs.com/org/${author.name.slice(1)}`)
			: // Otherwise use the User url
				encodeURI(author.link ?? `https://www.npmjs.com/~${author.name}`);

		return bold(hyperlink(author.name, hideLinkEmbed(authorUrl)));
	}
}

interface Args {
	package: string;
	target?: TransformedArguments.User;
}

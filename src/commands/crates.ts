import { FetchUserAgent } from '#constants/constants';
import { RedisKeys } from '#lib/redis-cache/RedisCacheClient';
import type { Crate, CrateResponse } from '#types/Crates';
import { errorResponse } from '#utils/response-utils';
import { redisCache } from '#utils/setup';
import { getGuildIds } from '#utils/utils';
import { bold, EmbedBuilder, hideLinkEmbed, hyperlink, inlineCode, italic, time, TimestampStyles, userMention } from '@discordjs/builders';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { cutText, isNullishOrEmpty } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds, type AutocompleteInteractionArguments, type TransformedArguments } from '@skyra/http-framework';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import he from 'he';

@RegisterCommand(
	(
		builder //
	) =>
		builder
			.setName('crates')
			.setDescription('Search the Crates registry for a Rust crate.')
			.addStringOption((builder) =>
				builder //
					.setName('crate')
					.setDescription('The crate to search for')
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
	#apiBaseUrl = 'https://crates.io/api/v1/crates' as const;
	#andListFormatter = new Intl.ListFormat(this.name, { type: 'conjunction' });

	public override async autocompleteRun(_: never, args: AutocompleteInteractionArguments<Args>) {
		if (args.focused !== 'crate' || isNullishOrEmpty(args.crate)) {
			return this.autocompleteNoResults();
		}

		const crateResponse = await this.fetchApi(args.crate);

		const redisInsertPromises: Promise<'OK'>[] = [];
		const results: APIApplicationCommandOptionChoice[] = [];

		for (const [index, hit] of crateResponse.crates?.entries() ?? []) {
			redisInsertPromises.push(redisCache.insertFor60Seconds<Crate>(RedisKeys.Crate, args.crate, index.toString(), hit));

			results.push({
				name: cutText(hit.name, 100),
				value: `${RedisKeys.Crate}:${args.crate}:${index}`
			});
		}

		if (redisInsertPromises.length) {
			await Promise.all(redisInsertPromises);
		}

		return this.autocomplete({
			choices: results.slice(0, 19)
		});
	}

	public override async chatInputRun(_: never, { crate: pkg, target }: Args) {
		const [, crateFromAutocomplete, nthResult] = pkg.split(':');
		const hitFromRedisCache = await redisCache.fetch<Crate>(RedisKeys.Crate, crateFromAutocomplete, nthResult);

		if (hitFromRedisCache) {
			return this.buildResponse(hitFromRedisCache, target);
		}

		const crateResponse = await this.fetchApi(crateFromAutocomplete ?? pkg, 1);

		if (!crateResponse.crates?.[0]) {
			return this.message(
				errorResponse({
					content: `no results were found for ${inlineCode(crateFromAutocomplete ?? pkg)}`
				})
			);
		}

		return this.buildResponse(crateResponse.crates[0]);
	}

	private async fetchApi(pkg: string, hitsPerPage = 25) {
		const searchUrl = new URL(this.#apiBaseUrl);
		searchUrl.searchParams.set('page', '1');
		searchUrl.searchParams.set('per_page', hitsPerPage.toString());
		searchUrl.searchParams.set('q', pkg);

		return fetch<CrateResponse<'crates'>>(
			searchUrl,
			{
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': FetchUserAgent
				}
			},
			FetchResultTypes.JSON
		);
	}

	private async buildResponse(hit: Crate, target?: TransformedArguments.User): Promise<Command.Response> {
		const owners = await this.fetchOwners(hit.id);
		const maintainers = owners.users //
			.filter((user) => Boolean(user.name))
			.map((owner) => hyperlink(owner.name, hideLinkEmbed(owner.url)));
		const dateCreated = hit.created_at ? time(new Date(hit.created_at), TimestampStyles.ShortDate) : 'unknown';
		const dateModified = hit.updated_at ? time(new Date(hit.updated_at), TimestampStyles.ShortDate) : 'unknown';
		const description = he.decode(cutText(hit.description ?? '', 1000));

		const embed = new EmbedBuilder()
			.setTitle(hit.name)
			.setURL(`https://crates.io/crates/${hit.id}`)
			.setColor(0xbc5a4c)
			.setDescription(
				cutText(
					[
						description,
						'',
						`❯ Maintainers: ${bold(this.formatListWithAnd(maintainers))}`,
						`❯ Latest version: ${bold(hit.newest_version)}`,
						`❯ Date Created: ${bold(dateCreated)}`,
						`❯ Date Modified: ${bold(dateModified)}`
					].join('\n'),
					2000
				)
			);

		return this.message({
			content: target?.user.id ? `${italic(`Crate suggestion for ${userMention(target.user.id)}:`)}` : undefined,
			embeds: [embed.toJSON()],
			allowed_mentions: {
				users: target?.user.id ? [target.user.id] : []
			}
		});
	}

	private async fetchOwners(pkg: string) {
		const ownersUrl = new URL(`${this.#apiBaseUrl}/${pkg}/owner_user`);

		return fetch<CrateResponse<'owners'>>(
			ownersUrl,
			{
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': FetchUserAgent
				}
			},
			FetchResultTypes.JSON
		);
	}

	private formatListWithAnd(list: string[]) {
		return this.#andListFormatter.format(list);
	}
}

interface Args {
	crate: string;
	target?: TransformedArguments.User;
}

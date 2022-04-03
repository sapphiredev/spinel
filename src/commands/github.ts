import { fetchIssuesAndPrs, fuzzilySearchForIssuesAndPullRequests, fuzzilySearchForRepository } from '#utils/github-fetch';
import { errorResponse } from '#utils/response-utils';
import { getGuildIds, getKnownGitHubOrganizationsForServerId } from '#utils/utils';
import { hideLinkEmbed, hyperlink, italic, userMention } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds, type AutocompleteInteractionArguments, type TransformedArguments } from '@skyra/http-framework';
import type { APIApplicationCommandAutocompleteInteraction } from 'discord-api-types/v10';

@RegisterCommand((builder) =>
	builder //
		.setName('github')
		.setDescription('Get information on an issue or pull request from the provided repository')
		.addStringOption((builder) =>
			builder //
				.setName('repository')
				.setDescription('The repository where I can find this issue or pull request number')
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addIntegerOption((builder) =>
			builder //
				.setName('number')
				.setDescription('The number of the issue or pull request')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption((builder) =>
			builder //
				.setName('owner')
				.setDescription('The owner of the repository to query.')
		)
		.addUserOption((builder) =>
			builder //
				.setName('target')
				.setDescription('Who should I ping that should look at these results?')
		)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	public override async autocompleteRun(
		interaction: APIApplicationCommandAutocompleteInteraction,
		args: AutocompleteInteractionArguments<Args<string>>
	) {
		const guildId = interaction.guild_id;

		switch (args.focused) {
			case 'repository': {
				if (!isNullishOrEmpty(guildId) && (isNullishOrEmpty(args.repository) || args.repository === '@')) {
					const knownOrganizationForGuild = getKnownGitHubOrganizationsForServerId(guildId);
					args.repository = `@${knownOrganizationForGuild}`;
				}

				const results = await fuzzilySearchForRepository({ repository: args.repository, guildId: interaction.guild_id });

				return this.autocomplete({ choices: results.slice(0, 19) });
			}
			case 'number': {
				if (isNullishOrEmpty(args.repository)) {
					return this.autocompleteNoResults();
				}

				if (!isNullishOrEmpty(guildId) && isNullishOrEmpty(args.owner)) {
					const knownOrganizationForGuild = getKnownGitHubOrganizationsForServerId(guildId);
					args.owner = knownOrganizationForGuild;
				}

				if (isNullishOrEmpty(args.owner)) {
					return this.autocompleteNoResults();
				}

				const results = await fuzzilySearchForIssuesAndPullRequests({ repository: args.repository, owner: args.owner, number: args.number });

				return this.autocomplete({ choices: results.slice(0, 19) });
			}
			default: {
				return this.autocompleteNoResults();
			}
		}
	}

	public override async chatInputRun(interaction: Command.Interaction, { repository, number, owner, target }: Args) {
		try {
			owner ??= getKnownGitHubOrganizationsForServerId(interaction.guild_id).trim();

			const data = await fetchIssuesAndPrs({ repository, owner, number });

			if (!data.author.login || !data.author.url || !data.number || !data.state || !data.title) {
				return this.failResponse(target);
			}

			const parts = [
				`${data.emoji} ${hyperlink(`#${data.number} in ${data.owner}/${data.repository}`, hideLinkEmbed(data.url))} by ${hyperlink(
					data.author.login,
					hideLinkEmbed(data.author.url)
				)} ${data.dateString}`,
				data.title
			];

			return this.message({
				content: `${
					target?.user.id
						? `${italic(`GitHub ${data.issueOrPr === 'PR' ? 'Pull Request' : 'Issue'} data for ${userMention(target?.user.id)}:`)}\n`
						: ''
				}${parts.join('\n')}`,
				allowed_mentions: {
					users: target?.user.id ? [target?.user.id] : []
				}
			});
		} catch (error) {
			// First we check if we need to handle a no data error
			if ((error as Error).message === 'no-data') {
				return this.message(
					errorResponse({
						content: `I was unable to find any Issue or Pull Request for http://github.com/${owner}/${repository}/issues/${number}. Be sure to check if that link is actually valid!`,
						allowed_mentions: {
							users: target?.user.id ? [target?.user.id] : []
						}
					})
				);
			}

			return this.failResponse(target);
		}
	}

	private failResponse(target?: TransformedArguments.User): ReturnType<Command['message']> {
		return this.message(
			errorResponse({
				content: 'Something went wrong with that query',
				allowed_mentions: {
					users: target?.user.id ? [target?.user.id] : []
				}
			})
		);
	}
}

interface Args<NumberType extends string | number = number> {
	repository: string;
	owner: string;
	number: NumberType;
	target?: TransformedArguments.User;
}

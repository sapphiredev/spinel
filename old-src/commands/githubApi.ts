import type { FastifyResponse } from '#types/Api';
import { fetchIssuesAndPrs } from '#utils/github-fetch';
import { errorResponse, interactionResponse, sendJson } from '#utils/responseHelpers';
import { hideLinkEmbed, hyperlink, italic } from '@discordjs/builders';
import type { Snowflake } from 'discord-api-types/v9';

export async function githubSearch({ repository, owner, number, response, target }: GitHubSearchParameters): Promise<FastifyResponse> {
	try {
		const data = await fetchIssuesAndPrs({ repository, owner, number });

		if (!data.author.login || !data.author.url || !data.number || !data.state || !data.title) {
			return sendJson(response, errorResponse({ content: 'something went wrong' }));
		}

		const parts = [
			`${data.emoji} ${hyperlink(`#${data.number} in ${data.owner}/${data.repository}`, hideLinkEmbed(data.url))} by ${hyperlink(
				data.author.login,
				hideLinkEmbed(data.author.url)
			)} ${data.dateString}`,
			data.title
		];

		return sendJson(
			response,
			interactionResponse({
				content: `${
					target ? `${italic(`GitHub ${data.issueOrPr === 'PR' ? 'Pull Request' : 'Issue'} data for <@${target}>:`)}\n` : ''
				}${parts.join('\n')}`,
				users: target ? [target] : []
			})
		);
	} catch (error) {
		// First we check if we need to handle a no data error
		if ((error as Error).message === 'no-data') {
			return sendJson(
				response,
				errorResponse({
					content: `I was unable to find any Issue or Pull Request for http://github.com/${owner}/${repository}/issues/${number}. Be sure to check if that link is actually valid!`
				})
			);
		}

		// Otherwise we send an unknown error
		return sendJson(response, errorResponse({ content: 'something went wrong' }));
	}
}

interface GitHubSearchParameters {
	response: FastifyResponse;
	repository: string;
	owner: string;
	number: number;
	target: Snowflake;
}

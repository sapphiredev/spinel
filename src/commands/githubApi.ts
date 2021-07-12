import { hideLinkEmbed, hyperlink, italic } from '@discordjs/builders';
import type { VercelResponse } from '@vercel/node';
import type { Snowflake } from 'discord-api-types/v8';
import type { GithubApi } from '../lib/github-fetch';
import { errorResponse, interactionResponse } from '../lib/responseHelpers';

export async function githubSearch({
	repository,
	owner,
	number,
	response,
	githubApiInstance,
	target
}: GitHubSearchParameters): Promise<VercelResponse> {
	try {
		const data = await githubApiInstance.fetchIssuesAndPrs({ repository, owner, number });

		if (!data.author.login || !data.author.url || !data.number || !data.state || !data.title) {
			console.error('DATA ERROR!!');
			console.error(data);
			return response.json(errorResponse({ content: 'something went wrong' }));
		}

		const parts = [
			`${data.emoji} ${hyperlink(`#${data.number} in ${data.owner}/${data.repository}`, hideLinkEmbed(data.url))} by ${hyperlink(
				data.author.login,
				hideLinkEmbed(data.author.url)
			)} ${data.dateString}`,
			data.title
		];

		return response.json(
			interactionResponse({
				content: `${
					target ? `${italic(`GitHub ${data.issueOrPr === 'PR' ? 'Pull Request' : 'Issue'} data for <@${target}>:`)}\n` : ''
				}${parts.join('\n')}`,
				users: target ? [target] : []
			})
		);
	} catch (error) {
		console.error(error);

		// First we check if we need to handle a no data error
		if ((error as Error).message === 'no-data') {
			return response.json(
				errorResponse({
					content: `I was unable to find any Issue or Pull Request for http://github.com/${owner}/${repository}/issues/${number}. Be sure to check if that link is actually valid!`
				})
			);
		}

		// Otherwise we send an unknown error
		return response.json(errorResponse({ content: 'something went wrong' }));
	}
}

interface GitHubSearchParameters {
	response: VercelResponse;
	repository: string;
	owner: string;
	number: number;
	target: Snowflake;
	githubApiInstance: GithubApi;
}

import { DurationFormatter, TimeTypes } from '@sapphire/time-utilities';
import { gql } from './constants';
import { GhIssueClosed, GhIssueOpen, GhPrClosed, GhPrMerged, GhPrOpen } from './emotes';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { GitHubBearerToken } from './env';
import type { IssueState, PullRequestState, Query, Repository } from './types/octokit';

const durationFormatter = new DurationFormatter({
	[TimeTypes.Year]: {
		1: 'year',
		DEFAULT: 'years'
	},
	[TimeTypes.Month]: {
		1: 'month',
		DEFAULT: 'months'
	},
	[TimeTypes.Week]: {
		1: 'week',
		DEFAULT: 'weeks'
	},
	[TimeTypes.Day]: {
		1: 'day',
		DEFAULT: 'days'
	},
	[TimeTypes.Hour]: {
		1: 'hour',
		DEFAULT: 'hours'
	},
	[TimeTypes.Minute]: {
		1: 'minute',
		DEFAULT: 'minutes'
	},
	[TimeTypes.Second]: {
		1: 'second',
		DEFAULT: 'seconds'
	}
});

const issuesAndPrQuery = gql`
	query ($repository: String!, $owner: String!, $number: Int!) {
		repository(owner: $owner, name: $repository) {
			issue(number: $number) {
				number
				title
				author {
					login
					url
				}
				state
				url
				createdAt
				closedAt
			}
			pullRequest(number: $number) {
				number
				title
				author {
					login
					url
				}
				state
				url
				createdAt
				closedAt
				mergedAt
			}
		}
	}
`;

export async function fetchIssuesAndPrs({ repository, owner, number }: FetchIssuesAndPrsParameters): Promise<IssueOrPrDetails> {
	const { data } = await fetch<GraphQLResponse>(
		'https://api.github.com/graphql',
		{
			method: FetchMethods.Post,
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${GitHubBearerToken}`
			},
			body: JSON.stringify({
				query: issuesAndPrQuery,
				variables: { repository, owner, number }
			})
		},
		FetchResultTypes.JSON
	);

	if (data.repository?.pullRequest) {
		return getDataForPullRequest(data.repository);
	} else if (data.repository?.issue) {
		return getDataForIssue(data.repository);
	}

	// This gets handled into a response in the githubSearch command
	throw new Error('no-data');
}

function getDataForIssue({ issue, ...repository }: Repository): IssueOrPrDetails {
	const dateToUse = issue?.state === 'CLOSED' ? new Date(issue?.closedAt).getTime() : new Date(issue?.createdAt).getTime();
	const dateOffset = durationFormatter.format(dateToUse - Date.now(), 2).slice(1);
	const dateStringPrefix = issue?.state === 'CLOSED' ? 'closed' : 'opened';
	const dateString = `${dateStringPrefix} ${dateOffset} ago`;

	return {
		author: {
			login: issue?.author?.login,
			url: issue?.author?.url
		},
		dateString,
		emoji: issue?.state === 'OPEN' ? GhIssueOpen : GhIssueClosed,
		issueOrPr: 'ISSUE',
		number: issue?.number,
		owner: repository.owner.login,
		repository: repository.name,
		state: issue?.state,
		title: issue?.title,
		url: issue?.url
	};
}

function getDataForPullRequest({ pullRequest, ...repository }: Repository): IssueOrPrDetails {
	const dateToUse =
		pullRequest?.state === 'CLOSED'
			? new Date(pullRequest?.closedAt).getTime()
			: pullRequest?.state === 'OPEN'
			? new Date(pullRequest?.createdAt).getTime()
			: new Date(pullRequest?.mergedAt).getTime();
	const dateOffset = durationFormatter.format(dateToUse - Date.now(), 2).slice(1);
	const dateStringPrefix = pullRequest?.state === 'CLOSED' ? 'closed' : pullRequest?.state === 'OPEN' ? 'opened' : 'merged';
	const dateString = `${dateStringPrefix} ${dateOffset} ago`;

	return {
		author: {
			login: pullRequest?.author?.login,
			url: pullRequest?.author?.url
		},
		dateString,
		emoji: pullRequest?.state === 'CLOSED' ? GhPrClosed : pullRequest?.state === 'OPEN' ? GhPrOpen : GhPrMerged,
		issueOrPr: 'PR',
		number: pullRequest?.number,
		owner: repository.owner.login,
		repository: repository.name,
		state: pullRequest?.state,
		title: pullRequest?.title,
		url: pullRequest?.url
	};
}

interface IssueOrPrDetails {
	author: {
		login?: string;
		url?: string;
	};
	dateString: string;
	emoji: string;
	issueOrPr: 'ISSUE' | 'PR';
	number?: number;
	owner: string;
	repository: string;
	state?: PullRequestState | IssueState;
	title?: string;
	url: string;
}

interface FetchIssuesAndPrsParameters {
	repository: string;
	owner: string;
	number: number;
}

interface GraphQLResponse {
	data: Record<'repository', Query['repository']>;
}

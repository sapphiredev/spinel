import { gql } from '#constants/constants';
import { GhIssueClosed, GhIssueOpen, GhPrClosed, GhPrMerged, GhPrOpen } from '#constants/emotes';
import { envParseString } from '#env/utils';
import type { IssueState, PullRequestState, Query, Repository } from '#types/octokit';
import { time, TimestampStyles } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';

const issuesAndPrQuery = gql`
	query ($repository: String!, $owner: String!, $number: Int!) {
		repository(owner: $owner, name: $repository) {
			name
			owner {
				login
			}
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
				Authorization: `Bearer ${envParseString('GH_API_KEY')}`
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
	const dateToUse = issue?.state === 'CLOSED' ? new Date(issue?.closedAt) : new Date(issue?.createdAt);
	const dateOffset = time(dateToUse, TimestampStyles.RelativeTime);
	const dateStringPrefix = issue?.state === 'CLOSED' ? 'closed' : 'opened';
	const dateString = `${dateStringPrefix} ${dateOffset}`;

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
			? new Date(pullRequest?.closedAt)
			: pullRequest?.state === 'OPEN'
			? new Date(pullRequest?.createdAt)
			: new Date(pullRequest?.mergedAt);
	const dateOffset = time(dateToUse, TimestampStyles.RelativeTime);
	const dateStringPrefix = pullRequest?.state === 'CLOSED' ? 'closed' : pullRequest?.state === 'OPEN' ? 'opened' : 'merged';
	const dateString = `${dateStringPrefix} ${dateOffset}`;

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

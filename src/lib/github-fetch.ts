import { DurationFormatter, TimeTypes } from '@sapphire/time-utilities';
import ApolloClient, { gql } from 'apollo-boost';
import crossFetch from 'cross-fetch';
import { GhIssueClosed, GhIssueOpen, GhPrClosed, GhPrMerged, GhPrOpen } from './emotes';
import { GitHubBearerToken } from './env';
import type { IssueState, PullRequestState, Query, Repository } from './types/octokit';

export class GithubApi {
	private apolloClient: ApolloClient<unknown>;

	private durationFormatter = new DurationFormatter({
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

	private issuesAndPrQuery = gql`
		query issueOrPrWithDetails($repository: String!, $owner: String!, $number: Int!) {
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

	public constructor() {
		this.apolloClient = new ApolloClient({
			uri: 'https://api.github.com/graphql',
			fetchOptions: {
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
					Authorization: `Bearer ${GitHubBearerToken}`
				}
			},
			fetch: crossFetch
		});
	}

	public async fetchIssuesAndPrs({ repository, owner, number }: FetchIssuesAndPrsParameters): Promise<IssueOrPrDetails> {
		const { data } = await this.apolloClient.query<GraphQLResponse>({
			query: this.issuesAndPrQuery,
			variables: { repository, owner, number }
		});

		if (data.repository?.pullRequest) {
			return this.getDataForPullRequest(data.repository);
		} else if (data.repository?.issue) {
			return this.getDataForIssue(data.repository);
		}

		// This gets handled into a response in the githubSearch command
		throw new Error('no-data');
	}

	private getDataForIssue({ issue, ...repository }: Repository): IssueOrPrDetails {
		const dateToUse = issue?.state === 'CLOSED' ? new Date(issue?.closedAt).getTime() : new Date(issue?.createdAt).getTime();
		const dateOffset = this.durationFormatter.format(dateToUse - Date.now(), 2).slice(1);
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

	private getDataForPullRequest({ pullRequest, ...repository }: Repository): IssueOrPrDetails {
		const dateToUse =
			pullRequest?.state === 'CLOSED'
				? new Date(pullRequest?.closedAt).getTime()
				: pullRequest?.state === 'OPEN'
				? new Date(pullRequest?.createdAt).getTime()
				: new Date(pullRequest?.mergedAt).getTime();
		const dateOffset = this.durationFormatter.format(dateToUse - Date.now(), 2).slice(1);
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

type GraphQLResponse = Record<'repository', Query['repository']>;

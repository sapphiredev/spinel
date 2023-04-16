import { FetchUserAgent } from '#constants/constants';
import { GhIssueClosed, GhIssueOpen, GhPrClosed, GhPrDraft, GhPrMerged, GhPrOpen } from '#constants/emotes';
import type { Issue, IssueState, PullRequest, PullRequestState, Query, Repository } from '#types/octokit.js';
import { getPreferredRepositoriesForServerId, gql } from '#utils/utils';
import { TimestampStyles, time } from '@discordjs/builders';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import { Result } from '@sapphire/result';
import { cutText, isNullishOrEmpty } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';

export async function fuzzilySearchForRepository({
	repository,
	guildId
}: GhSearchRepositoriesParameters): Promise<APIApplicationCommandOptionChoice[]> {
	const result = await Result.fromAsync(() =>
		fetch<GraphQLResponse<'searchRepositories'>>(
			'https://api.github.com/graphql',
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${envParseString('GH_API_KEY')}`,
					'User-Agent': FetchUserAgent
				},
				body: JSON.stringify({
					query: repositorySearch,
					variables: { repository }
				})
			},
			FetchResultTypes.JSON
		)
	);

	return result
		.map((value) => value.data.search)
		.match({
			ok: (search) => (search ? getDataForRepositorySearch(search.nodes, guildId) : getPreferredRepositoriesForServerId(guildId)),
			err: () => getPreferredRepositoriesForServerId(guildId)
		});
}

export async function fuzzilySearchForIssuesAndPullRequests({
	repository,
	owner,
	number
}: GhSearchIssuesAndPullRequestsParameters): Promise<APIApplicationCommandOptionChoice[]> {
	const result = await Result.fromAsync(() =>
		fetch<GraphQLResponse<'searchIssuesAndPrs'>>(
			'https://api.github.com/graphql',
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${envParseString('GH_API_KEY')}`,
					'User-Agent': FetchUserAgent
				},
				body: JSON.stringify({
					query: issuesAndPrSearch,
					variables: { repository, owner }
				})
			},
			FetchResultTypes.JSON
		)
	);

	return result
		.map((value) => value.data.repository)
		.match({
			ok: (value) =>
				isNullishOrEmpty(value?.pullRequests) && isNullishOrEmpty(value?.issues)
					? []
					: getDataForIssuesAndPrSearch(number, value?.pullRequests?.nodes, value?.issues?.nodes),
			err: () => []
		});
}

export async function fetchIssuesAndPrs({ repository, owner, number }: FetchIssuesAndPrsParameters): Promise<IssueOrPrDetails> {
	const result = await Result.fromAsync(() =>
		fetch<GraphQLResponse<'data'>>(
			'https://api.github.com/graphql',
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${envParseString('GH_API_KEY')}`,
					'User-Agent': FetchUserAgent
				},
				body: JSON.stringify({
					query: issuesAndPrQuery,
					variables: { repository, owner, number }
				})
			},
			FetchResultTypes.JSON
		)
	);

	const value = result.map((value) => value.data.repository).expect('no-data');

	if (value?.pullRequest) {
		return getDataForPullRequest(value);
	} else if (value?.issue) {
		return getDataForIssue(value);
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

	const getEmoji = () => {
		if (pullRequest?.state === 'CLOSED') return GhPrClosed;

		if (pullRequest?.state === 'OPEN') {
			if (pullRequest?.isDraft) {
				return GhPrDraft;
			}

			return GhPrOpen;
		}

		return GhPrMerged;
	};

	return {
		author: {
			login: pullRequest?.author?.login,
			url: pullRequest?.author?.url
		},
		dateString,
		emoji: getEmoji(),
		issueOrPr: 'PR',
		number: pullRequest?.number,
		owner: repository.owner.login,
		repository: repository.name,
		state: pullRequest?.state,
		title: pullRequest?.title,
		url: pullRequest?.url
	};
}

function getDataForRepositorySearch(repositories: Repository[], guildId: string | undefined): APIApplicationCommandOptionChoice[] {
	if (isNullishOrEmpty(repositories)) {
		return getPreferredRepositoriesForServerId(guildId);
	}

	const results: APIApplicationCommandOptionChoice[] = [];
	for (const repository of repositories) {
		results.push({ name: repository.nameWithOwner, value: repository.name });
	}

	return results;
}

function getDataForIssuesAndPrSearch(
	number: string,
	pullRequests: PullRequest[] | undefined,
	issues: Issue[] | undefined
): APIApplicationCommandOptionChoice[] {
	const numberParsedNumber = isNullishOrEmpty(number) ? NaN : Number(number);
	const issuesHasExactNumber = issues?.find((issue) => issue.number === numberParsedNumber);

	if (issuesHasExactNumber) {
		const parsedIssueState = issuesHasExactNumber?.state === 'OPEN' ? 'Open Issue' : 'Closed Issue';

		return [
			{
				name: cutText(`(${parsedIssueState}) - ${issuesHasExactNumber.number} - ${issuesHasExactNumber.title}`, 25),
				value: issuesHasExactNumber.number
			}
		];
	}

	const pullRequestsHaveExactNumber = pullRequests?.find((pullRequest) => pullRequest.number === numberParsedNumber);

	if (pullRequestsHaveExactNumber) {
		const parsedPullRequestState =
			pullRequestsHaveExactNumber?.state === 'CLOSED'
				? 'Closed Pull Request'
				: pullRequestsHaveExactNumber?.state === 'OPEN'
				? 'Open Pull Request'
				: 'Merged Pull Request';

		return [
			{
				name: cutText(`(${parsedPullRequestState}) - ${pullRequestsHaveExactNumber.number} - ${pullRequestsHaveExactNumber.title}`, 25),
				value: pullRequestsHaveExactNumber.number
			}
		];
	}

	const issueResults: APIApplicationCommandOptionChoice[] = [];
	const pullRequestResults: APIApplicationCommandOptionChoice[] = [];

	if (!isNullishOrEmpty(issues)) {
		for (const issue of issues) {
			const parsedIssueState = issue?.state === 'OPEN' ? 'Open Issue' : 'Closed Issue';

			if (!Number.isNaN(numberParsedNumber)) {
				if (!issue.number.toString().startsWith(numberParsedNumber.toString())) {
					continue;
				}
			}

			issueResults.push({
				name: cutText(`(${parsedIssueState}) - ${issue.number} - ${issue.title}`, 25),
				value: issue.number
			});
		}
	}

	if (!isNullishOrEmpty(pullRequests)) {
		for (const pullRequest of pullRequests) {
			const parsedPullRequestState =
				pullRequest?.state === 'CLOSED' ? 'Closed Pull Request' : pullRequest?.state === 'OPEN' ? 'Open Pull Request' : 'Merged Pull Request';

			if (!Number.isNaN(numberParsedNumber)) {
				if (!pullRequest.number.toString().startsWith(numberParsedNumber.toString())) {
					continue;
				}
			}

			pullRequestResults.push({
				name: cutText(`(${parsedPullRequestState}) - ${pullRequest.number} - ${pullRequest.title}`, 25),
				value: pullRequest.number
			});
		}
	}

	return [...issueResults.slice(0, 9), ...pullRequestResults.slice(0, 9)];
}

const repositorySearch = gql`
	query ($repository: String!) {
		search(type: REPOSITORY, query: $repository, first: 25) {
			nodes {
				... on Repository {
					nameWithOwner
					name
				}
			}
		}
	}
`;

const issuesAndPrSearch = gql`
	query ($repository: String!, $owner: String!) {
		repository(owner: $owner, name: $repository) {
			pullRequests(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
				nodes {
					... on PullRequest {
						number
						title
						state
					}
				}
			}
			issues(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
				nodes {
					... on Issue {
						number
						title
						state
					}
				}
			}
		}
	}
`;

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
				isDraft
				state
				url
				createdAt
				closedAt
				mergedAt
			}
		}
	}
`;

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

interface GhSearchRepositoriesParameters {
	repository: string;
	guildId: string | undefined;
}

interface GhSearchIssuesAndPullRequestsParameters {
	repository: string;
	owner: string;
	number: string;
}

interface FetchIssuesAndPrsParameters {
	repository: string;
	owner: string;
	number: number;
}

interface GraphQLResponse<T extends 'searchRepositories' | 'searchIssuesAndPrs' | 'data'> {
	data: T extends 'data'
		? Record<'repository', Query['repository']>
		: T extends 'searchRepositories'
		? Record<'search', Query['search']>
		: T extends 'searchIssuesAndPrs'
		? Record<'repository', Query['repositoryIssuesAndPrs']>
		: never;
}

export type PullRequestState =
	/** A pull request that has been closed without being merged. */
	| 'CLOSED'
	/** A pull request that has been closed by being merged. */
	| 'MERGED'
	/** A pull request that is still open. */
	| 'OPEN';

export type IssueState =
	/** An issue that has been closed */
	| 'CLOSED'
	/** An issue that is still open */
	| 'OPEN';

/** The query root of GitHub's GraphQL interface. */
export interface Query {
	__typename?: 'Query';
	/** Lookup a given repository by the owner and repository name. */
	repository?: Maybe<Repository>;
	/** Lookup a given repository by the owner and repository name. */
	repositoryIssuesAndPrs?: Maybe<Repository>;
	/** Lookup a given repository by the owner and repository name. */
	search?: Maybe<GraphQLConnection<SearchResultItem>>;
}

/** A repository contains the content for a project. */
interface Repository {
	__typename?: 'Repository';
	/** Returns a single issue from the current repository by number. */
	issue?: Maybe<Issue>;
	/** The name of the repository. */
	name: Scalars['String'];
	/** The repository's name with owner. */
	nameWithOwner: Scalars['String'];
	/** The User owner of the repository. */
	owner: RepositoryOwner;
	/** Returns a single pull request from the current repository by number. */
	pullRequest?: Maybe<PullRequest>;
	/** The HTTP URL for this repository */
	url: Scalars['URI'];
	/** A list of issues that have been opened in the repository. */
	issues?: Maybe<GraphQLConnection<Issue>>;
	/** A list of pull requests that have been opened in the repository. */
	pullRequests?: Maybe<GraphQLConnection<PullRequest>>;
}

/** Represents an owner of a Repository. */
interface RepositoryOwner {
	/** The username used to login. */
	login: Scalars['String'];
	/** The HTTP URL for the owner. */
	url: Scalars['URI'];
}

/** An Issue is a place to discuss ideas, enhancements, tasks, and bugs for a project. */
interface Issue {
	__typename?: 'Issue';
	/** The actor who authored the comment. */
	author?: Maybe<Actor>;
	/** Identifies the date and time when the object was closed. */
	closedAt?: Maybe<Scalars['DateTime']>;
	/** Identifies the date and time when the object was created. */
	createdAt: Scalars['DateTime'];
	/** Identifies the issue number. */
	number: Scalars['Int'];
	/** Identifies the state of the issue. */
	state: IssueState;
	/** Identifies the issue title. */
	title: Scalars['String'];
	/** The HTTP URL for this issue */
	url: Scalars['URI'];
}

/** A repository pull request. */
export interface PullRequest {
	__typename?: 'PullRequest';
	/** The actor who authored the comment. */
	author?: Maybe<Actor>;
	/** Identifies the date and time when the object was closed. */
	closedAt?: Maybe<Scalars['DateTime']>;
	/** Identifies the date and time when the object was created. */
	createdAt: Scalars['DateTime'];
	/** The date and time that the pull request was merged. */
	mergedAt?: Maybe<Scalars['DateTime']>;
	/** Identifies the pull request number. */
	number: Scalars['Int'];
	/** Identifies if the pull request is a draft. */
	isDraft: Scalars['Boolean'];
	/** Identifies the state of the pull request. */
	state: PullRequestState;
	/** Identifies the pull request title. */
	title: Scalars['String'];
	/** The HTTP URL for this pull request. */
	url: Scalars['URI'];
}

/** Represents an object which can take actions on GitHub. Typically a User or Bot. */
interface Actor {
	/** The username of the actor. */
	login: Scalars['String'];
	/** The HTTP URL for this actor. */
	url: Scalars['URI'];
}

/** A list of results that matched against a search query. */
interface GraphQLConnection<T> {
	/** The number of repositories that matched the search query. */
	repositoryCount: number;
	/** A list of nodes. */
	nodes: T[];
}

/** The results of a search. */
type SearchResultItem = Repository;

interface Scalars {
	ID: string;
	String: string;
	Int: number;
	/** An ISO-8601 encoded date string. */
	Date: any;
	/** An ISO-8601 encoded UTC date string. */
	DateTime: any;
	/** A Git object ID. */
	URI: any;
	/** The `Boolean` scalar type represents `true` or `false`. */
	Boolean: boolean;
}

type Maybe<T> = T | null;

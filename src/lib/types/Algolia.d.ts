export interface AlgoliaSearchResult<T extends 'npm' | 'docsearch'> {
	hits: Array<T extends 'docsearch' ? DocsearchHit : NpmSearchHit>;
	query: string;
}

export interface NpmSearchHit {
	bin: {
		[key: string]: string;
	};

	changelogFilename: string;

	computedKeywords: string[];

	computedMetadata: unknown;

	created: number;

	dependencies: {
		[key: string]: string;
	};

	dependents: number;

	deprecated: boolean;

	deprecatedReason: string | null;

	description: string;

	devDependencies: {
		[key: string]: string;
	};

	downloadsLast30Days: number;

	downloadsRatio: number;

	gitHead: string;

	githubRepo?: Partial<{
		head: string;
		path: string;
		project: string;
		user: string;
	}>;

	homage: string;

	humanDependents: string;

	humanDownloadsLast30Days: string;

	isDeprecated: boolean;

	jsDelivrHits: number;

	keywords: string[];

	lastCrawl: `${number}${number}${number}${number}-${number}${number}-${number}${number}T${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}Z`;

	lastPublisher: NpmPackageAuthor;

	license: string;

	modified: number;

	moduleTypes: ('esm' | 'cjs')[];

	name: string;

	objectID: string;

	originalAuthor: {
		name: string;
	};

	owner: NpmPackageAuthor;

	owners: NpmPackageAuthor[];

	popular: boolean;

	readme: string;

	repository?: Partial<{
		branch: string;
		head: string;
		host: string;
		path: string;
		project: string;
		type: 'git' | 'svn';
		url: string;
		user: string;
	}>;

	styleTypes: string[];

	tags: {
		[key: string]: string;
	};

	types: {
		ts: string;
	};

	version: string;

	versions: {
		latest: string;
		[key: string]: string;
	};
}

export interface DocsearchHit {
	anchor: string;
	content: string | null;
	hierarchy: AlgoliaHitHierarchy;
	url: string;
	url_without_anchor?: string;
}

export interface AlgoliaHitHierarchy {
	lvl0: string | null;
	lvl1: string | null;
	lvl2: string | null;
	lvl3: string | null;
	lvl4: string | null;
	lvl5: string | null;
	lvl6: string | null;
}

interface NpmPackageAuthor {
	avatar: string;

	email?: string;

	link: string;

	name: string;
}

export type CrateResponse<T extends 'owners' | 'crates'> = T extends 'owners'
	? {
			users: CrateUser[];
		}
	: {
			crates: Crate[];
		};

export interface Crate {
	badges: never[];
	categories: never;
	created_at: string;
	description: string | null;
	documentation: string;
	downloads: number;
	exact_match: boolean;
	homepage: string;
	id: string;
	keywords: never[];
	links: {
		owner_team: string;
		owner_user: string;
		owners: string;
		reverse_dependencies: string;
		version_downloads: string;
		versions: string;
	};
	max_stable_version: string;
	max_version: string;
	name: string;
	newest_version: string;
	recent_downloads: number;
	repository: string;
	updated_at: string;
	versions: never;
}

export interface CrateUser {
	avatar: string;
	id: number;
	kind: 'user';
	login: string;
	name: string;
	url: string;
}

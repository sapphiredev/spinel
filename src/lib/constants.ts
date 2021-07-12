import { RedCross } from './emotes';
import { AlgoliaApplicationId } from './env';

export const FailPrefix = `${RedCross} I am sorry, but`;
export const AlgoliaUrl = `https://${AlgoliaApplicationId}.algolia.net/1/indexes/discordjs/query`;
export const MdnUrl = `https://developer.mozilla.org`;
export const NodeUrl = 'https://nodejs.org';

export function cast<T>(value: unknown): T {
	return value as T;
}

/**
 * Fake GraphQL tag that just returns everything passed in as a single combined string
 * @remark used to trick the GraphQL parser into treating some code as GraphQL parseable data for syntax checking
 * @param gqlData data to pass off as GraphQL code
 */
export function gql(...args: any[]): string {
	return args[0].reduce((acc: string, str: string, idx: number) => {
		acc += str;
		if (Reflect.has(args, idx + 1)) acc += args[idx + 1];
		return acc;
	}, '');
}

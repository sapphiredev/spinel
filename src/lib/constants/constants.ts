import { RedCross } from './emotes';
import { AlgoliaApplicationId } from '../util/env';

export const FailPrefix = `${RedCross} I am sorry, but` as const;
export const AlgoliaUrl = `https://${AlgoliaApplicationId}.algolia.net/1/indexes/discordjs/query` as const;
export const MdnUrl = `https://developer.mozilla.org` as const;
export const NodeUrl = 'https://nodejs.org' as const;
export const MaxMessageLength = 4096;

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

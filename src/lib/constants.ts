import { inlineCode } from '@discordjs/builders';
import { RedCross } from './emotes';
import { AlgoliaApplicationId } from './env';

export const FailPrefix = inlineCode(`${RedCross} Error`);
export const AlgoliaUrl = `https://${AlgoliaApplicationId}.algolia.net/1/indexes/discordjs/query`;
export const MdnUrl = `https://developer.mozilla.org`;

export function cast<T>(value: unknown): T {
	return value as T;
}

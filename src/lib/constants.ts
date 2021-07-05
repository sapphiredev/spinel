import { RedCross } from './emotes';
import { AlgoliaApplicationId } from './env';

export const FailPrefix = `${RedCross} I am sorry, but`;
export const AlgoliaUrl = `https://${AlgoliaApplicationId}.algolia.net/1/indexes/discordjs/query`;
export const MdnUrl = `https://developer.mozilla.org`;
export const NodeUrl = 'https://nodejs.org';

export function cast<T>(value: unknown): T {
	return value as T;
}

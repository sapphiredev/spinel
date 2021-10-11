import Collection from '@discordjs/collection';
import { parse as parseToml } from '@ltd/j-toml';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { APISelectMenuOption } from 'discord-api-types/v9';
import { distance } from 'fastest-levenshtein';
import { TagUrl } from '../constants/constants';
import { SapphireGemId } from '../constants/emotes';
import type { Tag, TagSimilarityEntry } from '../types/Tags';
import { suggestionString } from './utils';

export const tagCache = new Collection<string, Tag>();

export function mapTagSimilarityEntry(entry: TagSimilarityEntry): APISelectMenuOption {
	return {
		label: entry.name === entry.word ? entry.name : `${entry.name} (${entry.word})`,
		value: entry.name,
		emoji: {
			id: SapphireGemId
		}
	};
}

export async function loadTags() {
	const file = await fetch(TagUrl, FetchResultTypes.Text);
	const data = parseToml(file, 1.0, '\n');
	for (const [key, value] of Object.entries(data)) {
		tagCache.set(key, value as unknown as Tag);
	}
}

export function findTag(query: string, target?: string) {
	const tag = tagCache.get(query) ?? tagCache.find((v) => v.keywords.includes(query));
	if (!tag) return null;
	return suggestionString('tag', tag.content, target);
}

export function findSimilar(query: string): Array<TagSimilarityEntry> {
	return tagCache
		.map((tag, key) => {
			const possible: TagSimilarityEntry[] = [];
			tag.keywords.forEach((a) => possible.push({ word: a, lev: distance(query, a.toLowerCase()), name: key }));
			return possible.sort((a, b) => a.lev - b.lev)[0];
		})
		.sort((a, b) => a.lev - b.lev)
		.slice(0, 5);
}

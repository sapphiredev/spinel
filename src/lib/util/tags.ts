import { FetchUserAgent } from '#constants/constants';
import { ExtractEmojiIdRegex, SapphireGemId } from '#constants/emotes';
import type { Tag, TagSimilarityEntry } from '#types/Tags';
import { suggestionString } from '#utils/utils';
import { Collection } from '@discordjs/collection';
import { parse as parseToml } from '@ltd/j-toml';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { jaroWinkler } from '@skyra/jaro-winkler';
import type { APISelectMenuOption } from 'discord-api-types/v10';
import { URL } from 'node:url';

const TagUrl = new URL('https://raw.githubusercontent.com/sapphiredev/sapphire-slashies/main/src/tags/tags.toml');

export const tagCache = new Collection<string, Tag>();

export function mapTagSimilarityEntry(entry: TagSimilarityEntry): APISelectMenuOption {
	return {
		label: entry.name === entry.word ? entry.name : `${entry.name} (${entry.word})`,
		value: entry.name,
		emoji: {
			id: ExtractEmojiIdRegex.exec(SapphireGemId)?.groups?.id
		}
	};
}

export async function loadTags() {
	const file = await fetch(
		TagUrl,
		{
			headers: {
				'User-Agent': FetchUserAgent
			}
		},
		FetchResultTypes.Text
	);

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

export function findSimilarTag(query: string): TagSimilarityEntry[] {
	return tagCache
		.map((tag, key) => {
			const possible: TagSimilarityEntry[] = [];

			for (const word of tag.keywords) {
				possible.push({ word, distance: jaroWinkler(query.toLowerCase(), word.toLowerCase()), name: key });
			}

			return possible.sort((a, b) => b.distance - a.distance)[0];
		})
		.sort((a, b) => b.distance - a.distance)
		.slice(0, 5);
}

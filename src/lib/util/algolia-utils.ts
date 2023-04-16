import type { AlgoliaHitHierarchy } from '#types/Algolia.js';
import { bold, italic, userMention } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import he from 'he';

export function buildResponseContent({ content, headerText, icon, target }: BuildResponseContentParameters) {
	return [
		target ? `${italic(`Documentation suggestion for ${userMention(target)}:`)}\n` : undefined, //
		icon,
		' ',
		bold(headerText),
		'\n',
		Array.isArray(content) ? content.join('\n') : content
	]
		.filter(Boolean)
		.join('');
}

interface BuildResponseContentParameters {
	content: string | string[];
	target: string | undefined;
	icon: string;
	headerText: string;
}

export function buildHierarchicalName(hierarchy: AlgoliaHitHierarchy, withSpaces = false): string | null {
	if (isNullishOrEmpty(hierarchy.lvl0)) return null;

	let hierarchicalName = hierarchy.lvl0.trim();
	const hierarchyLevelSplit = `${withSpaces ? ' ' : ''}/${withSpaces ? ' ' : ''}`;

	if (hierarchy.lvl1 && hierarchy.lvl1 !== hierarchy.lvl0) {
		hierarchicalName += `${hierarchyLevelSplit}${hierarchy.lvl1.trim()}`;
	}

	if (hierarchy.lvl2 && hierarchy.lvl2 !== hierarchy.lvl1 && hierarchy.lvl2 !== hierarchy.lvl0) {
		hierarchicalName += `${hierarchyLevelSplit}${hierarchy.lvl2.trim()}`;
	}

	if (hierarchy.lvl3 && hierarchy.lvl3 !== hierarchy.lvl2 && hierarchy.lvl3 !== hierarchy.lvl1 && hierarchy.lvl3 !== hierarchy.lvl0) {
		hierarchicalName += `${hierarchyLevelSplit}${hierarchy.lvl3.trim()}`;
	}

	if (
		hierarchy.lvl4 &&
		hierarchy.lvl4 !== hierarchy.lvl3 &&
		hierarchy.lvl4 !== hierarchy.lvl2 &&
		hierarchy.lvl4 !== hierarchy.lvl1 &&
		hierarchy.lvl4 !== hierarchy.lvl0
	) {
		hierarchicalName += `${hierarchyLevelSplit}${hierarchy.lvl4.trim()}`;
	}

	if (
		hierarchy.lvl5 &&
		hierarchy.lvl5 !== hierarchy.lvl4 &&
		hierarchy.lvl5 !== hierarchy.lvl3 &&
		hierarchy.lvl5 !== hierarchy.lvl2 &&
		hierarchy.lvl5 !== hierarchy.lvl1 &&
		hierarchy.lvl5 !== hierarchy.lvl0
	) {
		hierarchicalName += `${hierarchyLevelSplit}${hierarchy.lvl5.trim()}`;
	}

	if (
		hierarchy.lvl6 &&
		hierarchy.lvl6 !== hierarchy.lvl5 &&
		hierarchy.lvl6 !== hierarchy.lvl4 &&
		hierarchy.lvl6 !== hierarchy.lvl3 &&
		hierarchy.lvl6 !== hierarchy.lvl2 &&
		hierarchy.lvl6 !== hierarchy.lvl1 &&
		hierarchy.lvl6 !== hierarchy.lvl0
	) {
		hierarchicalName += `${hierarchyLevelSplit}${hierarchy.lvl6.trim()}`;
	}

	return he.decode(hierarchicalName);
}

import type { AlgoliaHitHierarchy } from '#types/Algolia.js';
import { HeadingLevel, bold, heading, italic, userMention } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';
import he from 'he';

export function buildResponseContent({ content, headerText, icon, target }: BuildResponseContentParameters) {
	const parts: string[] = [icon, ' ', bold(headerText), '\n', content];

	if (target) {
		parts.unshift(heading(italic(`Documentation suggestion for ${userMention(target)}`), HeadingLevel.Three), '\n');
	}

	return parts.join('');
}

interface BuildResponseContentParameters {
	content: string;
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

/**
 * Replaces the .html extension from a URL
 * @param url - The URL to replace the .html extension from
 * @returns The URL without the .html extension
 */
export function replaceDotHtml(url: string) {
	return url.replace(/\.html/, '');
}

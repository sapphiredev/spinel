import {
	DiscordJsDocsClass,
	DiscordJsDocsClassDev,
	DiscordJsDocsEnumOrInterface,
	DiscordJsDocsEvent,
	DiscordJsDocsEventDev,
	DiscordJsDocsField,
	DiscordJsDocsFieldDev,
	DiscordJsDocsInterfaceDev,
	DiscordJsDocsMethod,
	DiscordJsDocsMethodDev,
	DjsDocsDevIcon,
	DjsDocsStableIcon,
	ExtractEmojiIdRegex
} from '#constants/emotes';
import { suggestionString } from '#utils/utils';
import { bold, hideLinkEmbed, hyperlink, underscore } from '@discordjs/builders';
import { cutText, filterNullishOrEmpty, isNullishOrEmpty } from '@sapphire/utilities';
import type { APISelectMenuOption } from 'discord-api-types/v9';
import { Doc, DocTypes, type DocElement, type SourcesStringUnion } from 'discordjs-docs-parser';

function docTypeEmojiId(docType: DocTypes | null, dev = false): string {
	switch (docType) {
		case DocTypes.Typedef:
			return dev ? DiscordJsDocsInterfaceDev : DiscordJsDocsEnumOrInterface;
		case DocTypes.Prop:
			return dev ? DiscordJsDocsFieldDev : DiscordJsDocsField;
		case DocTypes.Class:
			return dev ? DiscordJsDocsClassDev : DiscordJsDocsClass;
		case DocTypes.Method:
			return dev ? DiscordJsDocsMethodDev : DiscordJsDocsMethod;
		case DocTypes.Event:
			return dev ? DiscordJsDocsEventDev : DiscordJsDocsEvent;
		default:
			return dev ? DjsDocsDevIcon : DjsDocsStableIcon;
	}
}

function stripMd(s = ''): string {
	return s.replace(/[`\*_]/gi, '');
}

function extractGenericTypeInfill(type: string): string {
	const match = type.match(/<(?<type>[A-Za-z]+)>/);
	return match?.groups?.type ? match.groups.type : type;
}

function formatInheritance(prefix: string, inherits: string[][], doc: Doc): string {
	const res = inherits.flatMap((element) => {
		if (Array.isArray(element)) return element.flat(5);
		return [element];
	});

	const inheritedLinks = res.map((element) => doc.get(extractGenericTypeInfill(element))?.link).filter(filterNullishOrEmpty);

	if (isNullishOrEmpty(inheritedLinks)) return '';

	return ` (${prefix} ${inheritedLinks.join(' and ')})`;
}

function resolveElementString(element: DocElement, doc: Doc): string {
	const parts = [];
	if (element.docType === 'event') parts.push(`${bold('(event)')} `);
	if (element.static) parts.push(`${bold('(static)')} `);
	parts.push(underscore(bold(element.link)));
	if (element.extends) parts.push(formatInheritance('extends', element.extends, doc));
	if (element.implements) parts.push(formatInheritance('implements', element.implements, doc));
	if (element.access === 'private') parts.push(` ${bold('PRIVATE')}`);
	if (element.deprecated) parts.push(` ${bold('DEPRECATED')}`);

	const s = ((element.formattedDescription || element.description) ?? '').split('\n');
	const description = s.length > 1 ? `${s[0]} ${hyperlink('(more...)', hideLinkEmbed(element.url ?? ''))}` : s[0];

	return `${parts.join('')}\n${description}`;
}

export function buildSelectOption(result: DocElement, dev = false): APISelectMenuOption {
	return {
		label: result.formattedName,
		value: result.formattedName,
		description: cutText(stripMd(result.description ?? 'No description found'), 95),
		emoji: {
			id: ExtractEmojiIdRegex.exec(docTypeEmojiId(result.docType, dev))?.groups?.id
		}
	};
}

export async function fetchDocs(source: SourcesStringUnion) {
	return Doc.fetch(source, { force: true });
}

export function fetchDocResult({ source, doc, query, target }: FetchDocResultParameters): string | null {
	const element = doc.get(...query.split(/\.|#/));
	if (!element) return null;
	const icon = docTypeEmojiId(element.docType, source === 'main');
	return suggestionString('documentation', `${icon} ${resolveElementString(element, doc)}`, target);
}

interface FetchDocResultParameters {
	source: SourcesStringUnion;
	doc: Doc;
	query: string;
	target?: string;
}

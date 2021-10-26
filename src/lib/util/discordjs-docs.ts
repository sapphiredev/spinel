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
import { hideLinkEmbed, hyperlink, underscore } from '@discordjs/builders';
import { cutText } from '@sapphire/utilities';
import { bold } from 'colorette';
import type { APISelectMenuOption } from 'discord-api-types/v9';
import Doc from 'discord.js-docs';

function docTypeEmojiId(docType: string, dev = false): string {
	switch (docType) {
		case 'typedef':
			return dev ? DiscordJsDocsInterfaceDev : DiscordJsDocsEnumOrInterface;
		case 'prop':
			return dev ? DiscordJsDocsFieldDev : DiscordJsDocsField;
		case 'class':
			return dev ? DiscordJsDocsClassDev : DiscordJsDocsClass;
		case 'method':
			return dev ? DiscordJsDocsMethodDev : DiscordJsDocsMethod;
		case 'event':
			return dev ? DiscordJsDocsEventDev : DiscordJsDocsEvent;
		default:
			return dev ? DjsDocsDevIcon : DjsDocsStableIcon;
	}
}

function escapeMDLinks(s = ''): string {
	return s.replace(/\[(.+?)\]\((.+?)\)/g, '[$1](<$2>)');
}

function stripMd(s = ''): string {
	return s.replace(/[`\*_]/gi, '');
}

function formatInheritance(prefix: string, inherits: DocElement[], doc: Doc): string {
	const res = inherits.map((element: any) => element.flat(5));
	return ` (${prefix} ${res.map((element) => escapeMDLinks(doc.formatType(element))).join(' and ')})`;
}

function resolveElementString(element: DocElement, doc: Doc): string {
	const parts = [];
	if (element.docType === 'event') parts.push(`${bold('(event)')} `);
	if (element.static) parts.push(`${bold('(static)')} `);
	parts.push(underscore(bold(escapeMDLinks(element.link ?? ''))));
	if (element.extends) parts.push(formatInheritance('extends', element.extends, doc));
	if (element.implements) parts.push(formatInheritance('implements', element.implements, doc));
	if (element.access === 'private') parts.push(` ${bold('PRIVATE')}`);
	if (element.deprecated) parts.push(` ${bold('DEPRECATED')}`);

	const s = escapeMDLinks(element.formattedDescription ?? element.description ?? '').split('\n');
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

export async function fetchDocs(source: string) {
	return Doc.fetch(source, { force: true });
}

export function fetchDocResult({ source, doc, query, target }: FetchDocResultParameters): string | null {
	const element = doc.get(...query.split(/\.|#/));
	if (!element) return null;
	const icon = docTypeEmojiId(element.docType, source === 'main');
	return suggestionString('documentation', `${icon} ${resolveElementString(element, doc)}`, target);
}

interface FetchDocResultParameters {
	source: string;
	doc: Doc;
	query: string;
	target?: string;
}

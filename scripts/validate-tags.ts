import { parse as parseToml } from '@ltd/j-toml';
import { objectEntries } from '@sapphire/utilities';
import { green, red } from 'colorette';
import { readFile } from 'node:fs/promises';
import { Conflict, Tag } from '../src/lib/types/Tags';

const tagsDir = new URL('../src/tags/', import.meta.url);

const file = await readFile(new URL('tags.toml', tagsDir), { encoding: 'utf-8' });
const data = parseToml(file, 1.0, '\n');

const conflicts: Conflict[] = [];
let hoisted = 0;

for (const [key, value] of objectEntries(data)) {
	const typedValue = value as unknown as Tag;
	const typedKey = key as string;

	const codeBlockRegex = /(`{1,3}).+?\1/gs;
	const detectionRegex = /\[[^\[\]]+?\]\([^<][^\(\)]+?[^>]\)/g;
	const cleanedContent = typedValue.content.replace(codeBlockRegex, '');

	const conflictLinks: string[] = [];
	let result: RegExpExecArray | null;

	while ((result = detectionRegex.exec(cleanedContent)) !== null) {
		conflictLinks.push(result[0]);
	}

	if (conflictLinks.length) {
		conflicts.push({
			firstName: typedKey,
			secondName: '',
			conflictKeyWords: conflictLinks,
			type: 'unescapedLink'
		});
	}

	if (typedValue.hoisted) {
		hoisted++;
	}

	for (const [otherKey, otherValue] of objectEntries(data)) {
		const typedOtherValue = otherValue as unknown as Tag;
		const typedOtherKey = otherKey as string;

		if (
			(typedValue.keywords.some((k) => !k.replace(/\s+/g, '').length) || !typedValue.content.replace(/\s+/g, '').length) &&
			!conflicts.some((c) => c.type === 'emptyKeyword' && c.firstName === typedKey)
		) {
			conflicts.push({
				firstName: typedKey,
				secondName: '',
				conflictKeyWords: [],
				type: 'emptyKeyword'
			});
		}

		if (typedKey !== typedOtherKey) {
			if (!typedValue.keywords.includes(typedKey) && !conflicts.some((c) => c.type === 'headerInKeywords' && c.firstName === typedKey)) {
				conflicts.push({
					firstName: typedKey,
					secondName: '',
					conflictKeyWords: [],
					type: 'headerInKeywords'
				});
			}

			const conflictKeyWords = typedValue.keywords.filter((k) => typedOtherValue.keywords.includes(k));

			if (conflictKeyWords.length && !conflicts.some((c) => [c.firstName, c.secondName].every((e) => [typedKey, typedOtherKey].includes(e)))) {
				conflicts.push({
					firstName: typedKey,
					secondName: typedOtherKey,
					conflictKeyWords,
					type: 'uniqueKeywords'
				});
			}
		}
	}
}

if (conflicts.length || hoisted > 20) {
	const parts: string[] = [];
	const { uniqueConflicts, headerConflicts, emptyConflicts, linkConflicts } = conflicts.reduce<{
		uniqueConflicts: Conflict[];
		headerConflicts: Conflict[];
		emptyConflicts: Conflict[];
		linkConflicts: Conflict[];
	}>(
		(a, c) => {
			switch (c.type) {
				case 'uniqueKeywords':
					a.uniqueConflicts.push(c);
					break;
				case 'headerInKeywords':
					a.headerConflicts.push(c);
					break;
				case 'emptyKeyword':
					a.emptyConflicts.push(c);
					break;
				case 'unescapedLink':
					a.linkConflicts.push(c);
			}
			return a;
		},
		{
			uniqueConflicts: [],
			headerConflicts: [],
			emptyConflicts: [],
			linkConflicts: []
		}
	);

	if (uniqueConflicts.length) {
		parts.push(
			`Tag validation error: Keywords have to be unique:\n${uniqueConflicts
				.map((c, i) => red(`${i}. [${c.firstName}] <> [${c.secondName}]: keywords: ${c.conflictKeyWords.join(', ')}`))
				.join('\n')}`
		);
	}

	if (headerConflicts.length) {
		parts.push(
			`Tag validation error: Tag header must be part of keywords:\n${headerConflicts.map((c, i) => red(`${i}. [${c.firstName}]`)).join('\n')}`
		);
	}

	if (emptyConflicts.length) {
		parts.push(
			`Tag validation error: Tag keywords and body cannot be empty:\n${emptyConflicts.map((c, i) => red(`${i}. [${c.firstName}]`)).join('\n')}`
		);
	}

	if (linkConflicts.length) {
		parts.push(
			`Tag validation error: Masked links need to be escaped as [label](<link>):\n${linkConflicts
				.map((c, i) => red(`${i}. tag: ${c.firstName}: ${c.conflictKeyWords.join(', ')}`))
				.join('\n')}`
		);
	}

	if (hoisted > 20) {
		parts.push(`Amount of hoisted tags exceeds 20 (is ${hoisted})`);
	}

	console.error(parts.join('\n\n'));
	process.exit(1);
}

console.log(green('Tag file successfully validated'));
process.exit(0);

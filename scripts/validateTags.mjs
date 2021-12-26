import { parse as parseToml } from '@ltd/j-toml';
import { green, red } from 'colorette';
import { readFile } from 'node:fs/promises';

const tagsDir = new URL('../src/tags/', import.meta.url);

const file = await readFile(new URL('tags.toml', tagsDir), { encoding: 'utf-8' });
const data = parseToml(file, 1.0, '\n');

/** @type {import('../src/lib/types/Tags').Conflict[]} */
const conflicts = [];
let hoisted = 0;

for (const [key, value] of Object.entries(data)) {
	/** @type {import('../src/lib/types/Tags').Tag} */
	const v = value;
	const codeBlockRegex = /(`{1,3}).+?\1/gs;
	const detectionRegex = /\[[^\[\]]+?\]\([^<][^\(\)]+?[^>]\)/g;
	const cleanedContent = v.content.replace(codeBlockRegex, '');

	const conflictLinks = [];
	/** @type {RegExpExecArray | null} */
	let result;

	while ((result = detectionRegex.exec(cleanedContent)) !== null) {
		conflictLinks.push(result[0]);
	}

	if (conflictLinks.length) {
		conflicts.push({
			firstName: key,
			secondName: '',
			conflictKeyWords: conflictLinks,
			type: 'unescapedLink'
		});
	}

	if (v.hoisted) {
		hoisted++;
	}

	for (const [otherKey, otherValue] of Object.entries(data)) {
		/** @type {import('../src/lib/types/Tags').Tag} */
		const oV = otherValue;

		if (
			(v.keywords.some((k) => !k.replace(/\s+/g, '').length) || !v.content.replace(/\s+/g, '').length) &&
			!conflicts.some((c) => c.type === 'emptyKeyword' && c.firstName === key)
		) {
			conflicts.push({
				firstName: key,
				secondName: '',
				conflictKeyWords: [],
				type: 'emptyKeyword'
			});
		}

		if (key !== otherKey) {
			if (!v.keywords.includes(key) && !conflicts.some((c) => c.type === 'headerInKeywords' && c.firstName === key)) {
				conflicts.push({
					firstName: key,
					secondName: '',
					conflictKeyWords: [],
					type: 'headerInKeywords'
				});
			}

			const conflictKeyWords = v.keywords.filter((k) => oV.keywords.includes(k));

			if (conflictKeyWords.length && !conflicts.some((c) => [c.firstName, c.secondName].every((e) => [key, otherKey].includes(e)))) {
				conflicts.push({
					firstName: key,
					secondName: otherKey,
					conflictKeyWords,
					type: 'uniqueKeywords'
				});
			}
		}
	}
}

if (conflicts.length || hoisted > 20) {
	const parts = [];
	const { uniqueConflicts, headerConflicts, emptyConflicts, linkConflicts } = conflicts.reduce(
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
			/** @type {import('../src/lib/types/Tags').Conflict[]} */
			uniqueConflicts: [],
			/** @type {import('../src/lib/types/Tags').Conflict[]} */
			headerConflicts: [],
			/** @type {import('../src/lib/types/Tags').Conflict[]} */
			emptyConflicts: [],
			/** @type {import('../src/lib/types/Tags').Conflict[]} */
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

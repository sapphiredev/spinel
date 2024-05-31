import { findSimilarTag, loadTags } from '../src/lib/util/tags.js';

describe('findSimilarTag', () => {
	beforeAll(async () => {
		await loadTags();
	});

	test('GIVEN existing tag name THEN returns tag', () => {
		const foundTags = findSimilarTag('guide');

		expect(foundTags).toEqual([
			{ word: 'guide', distance: 1, name: 'guide' },
			{
				word: 'guild id',
				distance: 0.8366666666666667,
				name: 'get-guildid-manually'
			},
			{ word: 'dragonite', distance: 0.6648148148148149, name: 'dragonite' },
			{ word: 'firacode', distance: 0.6583333333333333, name: 'good-font' },
			{
				distance: 0.6102564102564102,
				name: 'help',
				word: 'built in help'
			}
		]);
	});

	test('GIVEN existing tag alias THEN returns tag', () => {
		const foundTags = findSimilarTag('npm');

		expect(foundTags).toEqual([
			{ word: 'npm v7', distance: 0.8833333333333334, name: 'legacy-deps' },
			{
				word: 'params',
				distance: 0.6666666666666666,
				name: 'matching-parameters'
			},
			{
				word: 'pnpm-hoist',
				distance: 0.6555555555555556,
				name: 'pnpm-hoist'
			},
			{ word: 'chat input bots', distance: 0.6, name: 'bots' },
			{
				distance: 0.5990338164251208,
				name: 'experimental-decorators',
				word: 'experimental-decorators'
			}
		]);
	});

	test('GIVEN partial tag name THEN returns tag', () => {
		const foundTags = findSimilarTag('dotnet');

		expect(foundTags).toEqual([
			{
				word: 'dotnetfirstjslater',
				distance: 0.8888888888888888,
				name: 'dotnetfirstjslater'
			},
			{ word: 'dragonite', distance: 0.7566666666666668, name: 'dragonite' },
			{ word: 'tsnode', distance: 0.6944444444444443, name: 'ts-node' },
			{ word: 'docs', distance: 0.6888888888888889, name: 'apidocs' },
			{
				word: 'decorators',
				distance: 0.645,
				name: 'experimental-decorators'
			}
		]);
	});

	test('GIVEN an extremely bizarre query THEN still returns results', () => {
		const foundTags = findSimilarTag('this➖is➖going➖to➖return➖0➖results➖because➖it➖is➖way➖too➖different➖from➖a➖real➖tag');

		expect(foundTags).toEqual([
			{ word: 'tsnode', distance: 0.6085185185185185, name: 'ts-node' },
			{ word: 'help', distance: 0.595679012345679, name: 'help' },
			{
				word: 'transient-dependencies',
				distance: 0.5836910774410774,
				name: 'transient-dependencies'
			},
			{ word: 'dragonite', distance: 0.5792181069958847, name: 'dragonite' },
			{ word: 'slashies', distance: 0.5745884773662552, name: 'slashies' }
		]);
	});
});

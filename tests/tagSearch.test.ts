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
			{ word: 'firacode', distance: 0.6583333333333333, name: 'good-font' },
			{
				distance: 0.6102564102564102,
				name: 'help',
				word: 'built in help'
			},
			{
				word: 'language codes',
				distance: 0.6047619047619047,
				name: 'i18n'
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
				word: 'hostingproviders',
				distance: 0.5972222222222222,
				name: 'hostingproviders'
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
			{ word: 'tsnode', distance: 0.6944444444444443, name: 'ts-node' },
			{ word: 'docs', distance: 0.6888888888888889, name: 'apidocs' },
			{ word: 'i18next', distance: 0.6428571428571429, name: 'i18n' },
			{
				word: 'hosting',
				distance: 0.6428571428571429,
				name: 'hostingproviders'
			}
		]);
	});

	test('GIVEN an extremely bizarre query THEN still returns results', () => {
		const foundTags = findSimilarTag('this➖is➖going➖to➖return➖0➖results➖because➖it➖is➖way➖too➖different➖from➖a➖real➖tag');

		expect(foundTags).toEqual([
			{ word: 'tsnode', distance: 0.6085185185185185, name: 'ts-node' },
			{ word: 'help', distance: 0.595679012345679, name: 'help' },
			{
				word: 'transitive-dependencies',
				distance: 0.5847826086956522,
				name: 'transitive-dependencies'
			},
			{ word: 'slashies', distance: 0.5745884773662552, name: 'slashies' },
			{ word: 'eta', distance: 0.5679012345679012, name: 'eta' }
		]);
	});
});

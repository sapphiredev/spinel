import { findSimilarTag } from '../src/lib/util/tags';

describe('findSimilarTag', () => {
	test('GIVEN existing tag name THEN returns tag', () => {
		const foundTags = findSimilarTag('guide');

		expect(foundTags).toEqual([
			{ word: 'guide', distance: 1, name: 'guide' },
			{ word: 'firacode', distance: 0.6583333333333333, name: 'good-font' },
			{
				word: 'language codes',
				distance: 0.6047619047619047,
				name: 'i18n'
			},
			{ word: 'asking questions', distance: 0.6, name: 'asking' },
			{ word: 'apidocs', distance: 0.5619047619047619, name: 'apidocs' }
		]);
	});

	test('GIVEN existing tag alias THEN returns tag', () => {
		const foundTags = findSimilarTag('npm');

		console.log(foundTags);

		expect(foundTags).toEqual([
			{ word: 'npm v7', distance: 0.8833333333333334, name: 'legacy-deps' },
			{
				word: 'params',
				distance: 0.6666666666666666,
				name: 'matching-parameters'
			},
			{ word: 'chat input bots', distance: 0.6, name: 'slashbots' },
			{
				word: 'hostingproviders',
				distance: 0.5972222222222222,
				name: 'hostingproviders'
			},
			{ word: 'api', distance: 0.5555555555555555, name: 'apidocs' }
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
			{ word: 'docs', distance: 0.6888888888888889, name: 'apidocs' },
			{ word: 'i18next', distance: 0.6428571428571429, name: 'i18n' },
			{
				word: 'hosting',
				distance: 0.6428571428571429,
				name: 'hostingproviders'
			},
			{ word: 'bots', distance: 0.611111111111111, name: 'bots' }
		]);
	});

	test('GIVEN an extremely bizarre query THEN still returns results', () => {
		const foundTags = findSimilarTag('this➖is➖going➖to➖return➖0➖results➖because➖it➖is➖way➖too➖different➖from➖a➖real➖tag');

		expect(foundTags).toEqual([
			{ word: 'help', distance: 0.595679012345679, name: 'help' },
			{ word: 'slashies', distance: 0.5745884773662552, name: 'slashies' },
			{ word: 'eta', distance: 0.5679012345679012, name: 'eta' },
			{ word: 'asking', distance: 0.5650205761316872, name: 'asking' },
			{
				word: 'slashbots',
				distance: 0.5555555555555556,
				name: 'slashbots'
			}
		]);
	});
});

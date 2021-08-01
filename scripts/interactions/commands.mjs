import { ApplicationCommandOptionType } from 'discord-api-types/v9';

/** @type {import('discord-api-types/v9').RESTPostAPIApplicationCommandsJSONBody[]} */
export default [
	{
		name: 'invite',
		description: 'Use Sapphire in your server!'
	},
	{
		name: 'ping',
		description: 'Sends a ping and gets a pong back'
	},
	// {
	// 	name: 'docs',
	// 	description: 'Display Sapphire documentation',
	// 	options: [
	// 		{
	// 			type: ApplicationCommandOptionType.String,
	// 			name: 'query',
	// 			description: 'Query to search for',
	// 			required: true
	// 		},
	// 		{
	// 			type: ApplicationCommandOptionType.String,
	// 			name: 'source',
	// 			description: 'Source repository to use',
	// 			choices: [
	// 				{
	// 					name: '@sapphire/framework (latest)',
	// 					value: 'framework#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/pieces (latest)',
	// 					value: 'pieces#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/async-queue (latest)',
	// 					value: 'utilities#async-queue#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/decorators (latest)',
	// 					value: 'utilities#decorators#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/discord-utilities (latest)',
	// 					value: 'utilities#discord-utilities#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/discord.js-utilities (latest)',
	// 					value: 'utilities#discord.js-utilities#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/embed-jsx (latest)',
	// 					value: 'utilities#embed-jsx#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/eslint-config (latest)',
	// 					value: 'utilities#eslint-config#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/event-iterator (latest)',
	// 					value: 'utilities#event-iterator#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/fetch (latest)',
	// 					value: 'utilities#fetch#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/prettier-config (latest)',
	// 					value: 'utilities#prettier-config#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/ratelimits (latest)',
	// 					value: 'utilities#ratelimits#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/snowflake (latest)',
	// 					value: 'utilities#snowflake#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/stopwatch (latest)',
	// 					value: 'utilities#stopwatch#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/time-utilities (latest)',
	// 					value: 'utilities#time-utilities#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/ts-config (latest)',
	// 					value: 'utilities#ts-config#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/utilities (latest)',
	// 					value: 'utilities#utilities#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/plugin-api (latest)',
	// 					value: 'plugin#api#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/plugin-i18next (latest)',
	// 					value: 'plugin#i18next#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/plugin-logger (latest)',
	// 					value: 'plugin#logger#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/plugin-subcommands (latest)',
	// 					value: 'plugin#subcommands#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/plugin-interactions (latest)',
	// 					value: 'plugin#interactions#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/type (latest)',
	// 					value: 'type#latest'
	// 				},
	// 				{
	// 					name: '@sapphire/framework development branch',
	// 					value: 'framework#main'
	// 				},
	// 				{
	// 					name: '@sapphire/pieces development branch',
	// 					value: 'pieces#main'
	// 				}
	// 			]
	// 		},
	// 		{
	// 			name: 'target',
	// 			description: 'User to mention',
	// 			required: false,
	// 			type: ApplicationCommandOptionType.User
	// 		}
	// 	]
	// },
	// {
	// 	name: 'guide',
	// 	description: 'Search Sapphire Guide',
	// 	options: [
	// 		{
	// 			name: 'query',
	// 			description: 'Phrase to search for',
	// 			required: true,
	// 			type: ApplicationCommandOptionType.String
	// 		},
	// 		{
	// 			name: 'results',
	// 			description: 'How many search results to display at most',
	// 			required: false,
	// 			type: 4,
	// 			choices: [
	// 				{
	// 					name: '1 result',
	// 					value: 1
	// 				},
	// 				{
	// 					name: '2 results (default)',
	// 					value: 2
	// 				},
	// 				{
	// 					name: '3 results',
	// 					value: 3
	// 				},
	// 				{
	// 					name: '4 results',
	// 					value: 4
	// 				},
	// 				{
	// 					name: '5 results',
	// 					value: 5
	// 				}
	// 			]
	// 		},
	// 		{
	// 			name: 'target',
	// 			description: 'User to mention',
	// 			required: false,
	// 			type: ApplicationCommandOptionType.User
	// 		}
	// 	]
	// },
	{
		name: 'djs',
		description: 'Search discord.js documentation',
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: 'query',
				description: 'Class or Class#method combination to search for',
				required: true
			},
			{
				type: ApplicationCommandOptionType.String,
				name: 'source',
				description: 'Source repository to use',
				choices: [
					{
						name: 'collection (util structure)',
						value: 'collection'
					},
					{
						name: 'development branch (#master)',
						value: 'master'
					},
					{
						name: 'stable branch (#stable) (default)',
						value: 'stable'
					}
				]
			},
			{
				name: 'target',
				description: 'User to mention',
				required: false,
				type: ApplicationCommandOptionType.User
			}
		]
	},
	{
		name: 'djs-guide',
		description: 'Search discordjs.guide',
		options: [
			{
				name: 'query',
				description: 'Phrase to search for',
				required: true,
				type: ApplicationCommandOptionType.String
			},
			{
				name: 'results',
				description: 'How many search results to display at most',
				required: false,
				type: 4,
				choices: [
					{
						name: '1 result',
						value: 1
					},
					{
						name: '2 results (default)',
						value: 2
					},
					{
						name: '3 results',
						value: 3
					},
					{
						name: '4 results',
						value: 4
					},
					{
						name: '5 results',
						value: 5
					}
				]
			},
			{
				name: 'target',
				description: 'User to mention',
				required: false,
				type: ApplicationCommandOptionType.User
			}
		]
	},
	{
		name: 'mdn',
		description: 'Search the Mozilla Developer Network documentation',
		options: [
			{
				name: 'query',
				description: 'Class or method to search for',
				required: true,
				type: ApplicationCommandOptionType.String
			},
			{
				name: 'target',
				description: 'User to mention',
				required: false,
				type: ApplicationCommandOptionType.User
			}
		]
	},
	{
		name: 'node',
		description: 'Search the Node.js documentation',
		options: [
			{
				name: 'query',
				description: 'Class, method or event to search for',
				required: true,
				type: ApplicationCommandOptionType.String
			},
			{
				name: 'version',
				description: 'Which version of Node.js do you want to search?',
				required: false,
				type: ApplicationCommandOptionType.String,
				choices: [
					{
						name: 'v12',
						value: 'latest-v12.x'
					},
					{
						name: 'v14',
						value: 'latest-v14.x'
					},
					{
						name: 'v16 (default)',
						value: 'latest-v16.x'
					}
				]
			},
			{
				name: 'target',
				description: 'User to mention',
				required: false,
				type: ApplicationCommandOptionType.User
			}
		]
	},
	{
		name: 'github',
		description: 'Get information on an Issue or Pull Request from the provided repository',
		options: [
			{
				name: 'number',
				description: 'The number of the Issue or Pull Request',
				required: true,
				type: ApplicationCommandOptionType.Integer
			},
			{
				name: 'repository',
				description: 'The repository for which to get this Issue or Pull Request',
				required: true,
				type: ApplicationCommandOptionType.String
			},
			{
				name: 'owner',
				description: 'The owner of the repository to query. Defaults to `sapphiredev`',
				required: false,
				type: ApplicationCommandOptionType.String
			},
			{
				name: 'target',
				description: 'User to mention',
				required: false,
				type: ApplicationCommandOptionType.User
			}
		]
	}
];

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
	{
		name: 'slashies-eta',
		description: 'Lets you know when Slash Command Support is landing in @sapphire/framework'
	},
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

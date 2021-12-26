import { SlashCommandBuilder } from '@discordjs/builders';

const inviteCommand = new SlashCommandBuilder() //
	.setName('invite')
	.setDescription('Add the Slashies Application Command Handler to your server')
	.toJSON();

const pingCommand = new SlashCommandBuilder() //
	.setName('ping')
	.setDescription('Sends a ping and gets a pong back!')
	.toJSON();

const slashiesEtaCommand = new SlashCommandBuilder() //
	.setName('slashies-eta')
	.setDescription('Lets you know when Slash Command Support is landing in @sapphire/framework')
	.toJSON();

const sapphireDocsCommand = new SlashCommandBuilder() //
	.setName('sapphire')
	.setDescription('Search Sapphire guides and documentation')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The phrase to search for')
			.setRequired(true)
	)
	.addBooleanOption((builder) =>
		builder //
			.setName('include-docs')
			.setDescription('Should I include docs in the result? When set to false, only guides results are returned.')
	)
	.addIntegerOption((builder) =>
		builder //
			.setName('results')
			.setDescription('How many search results do you want to show at maximum?')
			.addChoice('1 Result', 1)
			.addChoice('2 Results', 2)
			.addChoice('3 Results', 3)
			.addChoice('4 Results', 4)
			.addChoice('5 Results', 5)
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const djsDocsCommand = new SlashCommandBuilder() //
	.setName('djs')
	.setDescription('Search discord.js documentation')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The phrase to search for')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addStringOption((builder) =>
		builder //
			.setName('source')
			.setDescription('Source repository to use')
			.addChoice('Main library - stable branch (default)', 'stable')
			.addChoice('Main library - main branch', 'main')
			.addChoice('Collection', 'collection')
			.addChoice('Builders', 'builders')
			.addChoice('Voice', 'voice')
			.addChoice('RPC', 'rpc')
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const djsGuideCommand = new SlashCommandBuilder() //
	.setName('djs-guide')
	.setDescription('Search discord.js guides')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The phrase to search for')
			.setRequired(true)
	)
	.addIntegerOption((builder) =>
		builder //
			.setName('results')
			.setDescription('How many search results do you want to show at maximum?')
			.addChoice('1 Result', 1)
			.addChoice('2 Results', 2)
			.addChoice('3 Results', 3)
			.addChoice('4 Results', 4)
			.addChoice('5 Results', 5)
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const mdnCommand = new SlashCommandBuilder() //
	.setName('mdn')
	.setDescription('Search the Mozilla Developer Network documentation')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The phrase to search for')
			.setRequired(true)
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const nodeCommand = new SlashCommandBuilder() //
	.setName('node')
	.setDescription('Search the Node.js documentation')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The phrase to search for')
			.setRequired(true)
	)
	.addStringOption((builder) =>
		builder //
			.setName('version')
			.setDescription('Which version of Node.js do you want to search?')
			.addChoice('Node.js 12', 'latest-v12.x')
			.addChoice('Node.js 14', 'latest-v14.x')
			.addChoice('Node.js 16 (default)', 'latest-v16.x')
			.addChoice('Node.js 17', 'latest-v17.x')
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const githubCommand = new SlashCommandBuilder() //
	.setName('github')
	.setDescription('Get information on an issue or pull request from the provided repository')
	.addIntegerOption((builder) =>
		builder //
			.setName('number')
			.setDescription('The number of the issue or pull request')
			.setRequired(true)
	)
	.addStringOption((builder) =>
		builder //
			.setName('repository')
			.setDescription('The repository where I can find this issue or pull request number')
			.setRequired(true)
	)
	.addStringOption((builder) =>
		builder //
			.setName('owner')
			.setDescription('The owner of the repository to query. Defaults to `sapphiredev`.')
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const tagCommand = new SlashCommandBuilder() //
	.setName('tag')
	.setDescription('Send a tag by name or by alias')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The name or alias of the tag to send')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const tagSearchCommand = new SlashCommandBuilder() //
	.setName('tag-search')
	.setDescription('Query and select a tag by name, alias, or content')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The search query to use when trying to find your tag.')
			.setRequired(true)
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const discordDocsCommand = new SlashCommandBuilder() //
	.setName('ddocs')
	.setDescription('Search Discord Developer documentation')
	.addStringOption((builder) =>
		builder //
			.setName('query')
			.setDescription('The phrase to search for')
			.setRequired(true)
	)
	.addIntegerOption((builder) =>
		builder //
			.setName('results')
			.setDescription('How many search results do you want to show at maximum?')
			.addChoice('1 Result', 1)
			.addChoice('2 Results', 2)
			.addChoice('3 Results', 3)
			.addChoice('4 Results', 4)
			.addChoice('5 Results', 5)
	)
	.addUserOption((builder) =>
		builder //
			.setName('target')
			.setDescription('Who should I ping that should look at these results?')
	)
	.toJSON();

const reloadTagsCommand = new SlashCommandBuilder() //
	.setName('reload-tags')
	.setDescription('Reload the tags cache in memory. This can only be used by Sapphire staff.')
	.setDefaultPermission(false)
	.toJSON();

const commands = [
	inviteCommand,
	pingCommand,
	slashiesEtaCommand,
	sapphireDocsCommand,
	djsDocsCommand,
	djsGuideCommand,
	mdnCommand,
	nodeCommand,
	githubCommand,
	tagCommand,
	tagSearchCommand,
	discordDocsCommand,
	reloadTagsCommand
];

export default commands;

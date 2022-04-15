import { RedCross } from '#constants/emotes';
import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, type APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import os from 'node:os';

export const FailPrefix = `${RedCross} I am sorry, but` as const;
export const FetchUserAgent = `Sapphire Application Commands/2.0.0 (node-fetch) ${os.platform()}/${os.release()} (https://github.com/sapphiredev/spinel/tree/main)`;

export const sapphirePreferredRepositories = [
	/* 01 */ { name: '📌 Sapphire Framework', value: 'framework' },
	/* 02 */ { name: '📌 Sapphire Utilities', value: 'utilities' },
	/* 03 */ { name: '📌 Sapphire Plugins', value: 'plugins' },
	/* 04 */ { name: '📌 Awesome Sapphire', value: 'awesome-sapphire' },
	/* 05 */ { name: '📌 Sapphire Pieces', value: 'pieces' },
	/* 06 */ { name: '📌 Sapphire Website', value: 'website' },
	/* 07 */ { name: '📌 Sapphire CLI', value: 'cli' },
	/* 08 */ { name: '📌 Shapeshift', value: 'shapeshift' },
	/* 09 */ { name: '📌 Spinel', value: 'spinel' },
	/* 10 */ { name: '📌 Sapphire Template', value: 'sapphire-template' },
	/* 11 */ { name: '📌 Type', value: 'type' },
	/* 12 */ { name: '📌 Examples', value: 'examples' },
	/* 13 */ { name: '📌 Resource Webhooks', value: 'resource-webhooks' }
];

const skyraProjectPreferredRepositories = [
	/* 01 */ { name: '📌 Skyra', value: 'skyra' },
	/* 02 */ { name: '📌 Skyra.pw', value: 'skyra.pw' },
	/* 03 */ { name: '📌 ArchId Components', value: 'archid-components' },
	/* 04 */ { name: '📌 Resource Webhooks', value: 'resource-webhooks' },
	/* 05 */ { name: '📌 Discord Components', value: 'discord-components' },
	/* 06 */ { name: '📌 Char', value: 'char' },
	/* 07 */ { name: '📌 Editable Commands', value: 'editable-commands' },
	/* 08 */ { name: '📌 Docker Images', value: 'docker-images' },
	/* 09 */ { name: '📌 Jaro Winkler', value: 'jaro-winkler' },
	/* 10 */ { name: '📌 Tags', value: 'tags' },
	/* 11 */ { name: '📌 Gifenc', value: 'gifenc' },
	/* 12 */ { name: '📌 Acrysel', value: 'acrysel' },
	/* 13 */ { name: '📌 Teryl', value: 'teryl' },
	/* 14 */ { name: '📌 Iris', value: 'iris' },
	/* 15 */ { name: '📌 Nayre', value: 'nayre' },
	/* 16 */ { name: '📌 Artiel', value: 'artiel' },
	/* 17 */ { name: '📌 Nekokai', value: 'nekokai' }
];

const djsPreferredRepositories = [
	/* 01 */ { name: '📌 DiscordJS', value: 'discord.js' },
	/* 02 */ { name: '📌 Discord API Types', value: 'discord-api-types' },
	/* 03 */ { name: '📌 Guide', value: 'guide' },
	/* 04 */ { name: '📌 Opus', value: 'opus' },
	/* 05 */ { name: '📌 RPC', value: 'rpc' },
	/* 06 */ { name: '📌 Website', value: 'website' },
	/* 07 */ { name: '📌 Resource Webhooks', value: 'resource-webhooks' }
];

export const preferredRepositories = new Map<string, APIApplicationCommandOptionChoice[]>([
	['838895946397646850', sapphirePreferredRepositories],
	['737141877803057244', sapphirePreferredRepositories],
	['541738403230777351', skyraProjectPreferredRepositories],
	['254360814063058944', skyraProjectPreferredRepositories],
	['222078108977594368', djsPreferredRepositories]
]);

export const KnownServerIdsToGitHubOrganizations = new Map<string, string>([
	['838895946397646850', 'sapphiredev'],
	['737141877803057244', 'sapphiredev'],
	['541738403230777351', 'skyra-project'],
	['254360814063058944', 'skyra-project'],
	['222078108977594368', 'discordjs']
]);

export const SupportServerButton = new ButtonBuilder()
	.setStyle(ButtonStyle.Link)
	.setURL('https://discord.gg/sapphiredev')
	.setLabel('Support Server')
	.setEmoji({ name: '🆘' });

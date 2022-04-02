import { RedCross } from '#constants/emotes';
import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, type APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import os from 'node:os';

export const FailPrefix = `${RedCross} I am sorry, but` as const;
export const MaxMessageLength = 4096;
export const FetchUserAgent = `Sapphire Application Commands/2.0.0 (node-fetch) ${os.platform()}/${os.release()} (https://github.com/sapphiredev/sapphire-application-commands/tree/main)`;

export const enum BrandingColors {
	Primary = 0x254fb9,
	Secondary = 0x729ef4
}

export const preferredRepositories: APIApplicationCommandOptionChoice[] = [
	/* 01 */ { name: '📌 Sapphire Framework', value: 'framework' },
	/* 02 */ { name: '📌 Sapphire Utilities', value: 'utilities' },
	/* 03 */ { name: '📌 Sapphire Plugins', value: 'plugins' },
	/* 04 */ { name: '📌 Awesome Sapphire', value: 'awesome-sapphire' },
	/* 05 */ { name: '📌 Sapphire Pieces', value: 'pieces' },
	/* 07 */ { name: '📌 Sapphire Website', value: 'website' },
	/* 08 */ { name: '📌 Sapphire CLI', value: 'cli' },
	/* 06 */ { name: '📌 Shapeshift', value: 'shapeshift' }
];

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

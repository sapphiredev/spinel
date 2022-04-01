import { RedCross } from '#constants/emotes';
import { ButtonStyle, ComponentType, type APIApplicationCommandOptionChoice, type APIButtonComponent } from 'discord-api-types/v10';
import os from 'node:os';

export const FailPrefix = `${RedCross} I am sorry, but` as const;
export const MdnUrl = `https://developer.mozilla.org` as const;
export const NodeUrl = 'https://nodejs.org' as const;
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
	['541738403230777351', 'skyra-project']
]);

export const SupportServerButton: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Link,
	url: 'https://discord.gg/sapphiredev',
	label: 'Support server',
	emoji: { name: '🆘' }
};

import { RedCross } from '#constants/emotes';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v9';
import os from 'node:os';

export const FailPrefix = `${RedCross} I am sorry, but` as const;
export const MdnUrl = `https://developer.mozilla.org` as const;
export const NodeUrl = 'https://nodejs.org' as const;
export const MaxMessageLength = 4096;
export const FetchUserAgent = `Sapphire Application Commands/1.0.0 (node-fetch) ${os.platform()}/${os.release()} (https://github.com/sapphiredev/sapphire-application-commands/tree/main)`;

export const preferredRepositories: APIApplicationCommandOptionChoice[] = [
	/* 01 */ { name: '📌 Sapphire Framework', value: 'framework' },
	/* 02 */ { name: '📌 Sapphire Utilities', value: 'utilities' },
	/* 03 */ { name: '📌 Sapphire Plugins', value: 'plugins' },
	/* 04 */ // { name: '📌 Awesome Sapphire', value: 'awesome-sapphire' }, // TODO: Enable when the repository has been created
	/* 05 */ { name: '📌 Sapphire Pieces', value: 'pieces' },
	/* 07 */ { name: '📌 Sapphire Website', value: 'website' },
	/* 08 */ { name: '📌 Sapphire CLI', value: 'cli' },
	/* 06 */ { name: '📌 Shapeshift', value: 'shapeshift' }
];

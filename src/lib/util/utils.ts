import { userMention } from '@discordjs/builders';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v9';
import os from 'node:os';

export function suggestionString(suggestionType: string, guaranteed?: string, target?: string): string {
	const messageParts = [];
	const [first, ...rest] = suggestionType;

	if (target) {
		messageParts.push(`*${first.toUpperCase()}${rest.join('')} suggestion`);

		if (target) {
			messageParts.push(` for ${userMention(target)}`);
		}

		messageParts.push(':*\n');
	}

	if (guaranteed) {
		messageParts.push(guaranteed);
	}

	return messageParts.join('');
}

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

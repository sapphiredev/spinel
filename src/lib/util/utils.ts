import { userMention } from '@discordjs/builders';

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

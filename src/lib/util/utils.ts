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

export function cast<T>(value: unknown): T {
	return value as T;
}

/**
 * Fake GraphQL tag that just returns everything passed in as a single combined string
 * @remark used to trick the GraphQL parser into treating some code as GraphQL parseable data for syntax checking
 * @param gqlData data to pass off as GraphQL code
 */
export function gql(...args: any[]): string {
	return args[0].reduce((acc: string, str: string, idx: number) => {
		acc += str;
		if (Reflect.has(args, idx + 1)) acc += args[idx + 1];
		return acc;
	}, '');
}

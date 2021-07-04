import { inlineCode } from '@discordjs/builders';
import { RedCross } from './emotes';

export const FailPrefix = inlineCode(`${RedCross} Error`);

export function cast<T>(value: unknown): T {
	return value as T;
}

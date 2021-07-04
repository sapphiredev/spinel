import { inlineCode } from '@discordjs/builders';

export const ApplicationId = process.env.APPLICATION_ID;
export const PublicKeyBuffer = Buffer.from(process.env.PUBLIC_KEY, 'hex');

export const DjsGuideIcon = `<:djsguide:814216203466965052>`;
export const DjsDocsStableIcon = '<:djs:851213352314732544>';
export const DjsDocsDevIcon = '<:djsdev:851213342541873182>';
export const RedCross = '<:redCross:637706251257511973>';

export const FailPrefix = inlineCode(`${RedCross} Error`);

export function cast<T>(value: unknown): T {
	return value as T;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv {
			APPLICATION_ID: string;
			APPLICATION_SECRET: string;
			PUBLIC_KEY: string;
		}
	}
}

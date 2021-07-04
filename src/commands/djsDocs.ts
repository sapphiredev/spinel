import type { VercelResponse } from '@vercel/node';
import type { Snowflake } from 'discord-api-types';

// TODO: impl
/* eslint-disable-next-line */
export function djsDocs(params: DjsDocsParameters): VercelResponse {}

interface DjsDocsParameters {
	response: VercelResponse;
	source: string;
	query: string;
	target: Snowflake;
}

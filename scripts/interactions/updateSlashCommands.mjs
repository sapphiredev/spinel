process.env.NODE_ENV ??= 'production';

import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { OAuth2Routes, RouteBases, Routes } from 'discord-api-types/v8';
import { config } from 'dotenv-cra';
import { stringify } from 'node:querystring';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import commands from './commands.mjs';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const ApplicationSecret = process.env.DISCORD_APPLICATION_SECRET;
const ApplicationId = process.env.DISCORD_APPLICATION_ID;

if (!ApplicationId || !ApplicationSecret) {
	throw new Error('Please fill in all env variables in your ".env.local" file');
}

/**
 * Retrieves a client_credentials access token from the Discord OAUTH API
 * @returns {Promise<string>} The access token to be used
 */
async function getBearerToken() {
	/** @type {import('discord-api-types/v8').RESTPostOAuth2ClientCredentialsResult} */
	const body = await fetch(
		OAuth2Routes.tokenURL,
		{
			headers: {
				Authorization: `Basic ${Buffer.from(`${ApplicationId}:${ApplicationSecret}`).toString('base64')}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: stringify({
				grant_type: 'client_credentials',
				scope: 'applications.commands.update'
			}),
			method: FetchMethods.Post
		},
		FetchResultTypes.JSON
	);

	if (!body.access_token) throw new Error(`Failed to fetch access token. Raw body: "${JSON.stringify(body)}"`);

	return body.access_token;
}

async function batchUpdateCommands(token) {
	const res = await fetch(
		`${RouteBases.api}${Routes.applicationCommands(ApplicationId)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			method: FetchMethods.Put,
			body: JSON.stringify(commands)
		},
		FetchResultTypes.Result
	);

	if (!res.ok) throw new Error(`Failed to batch update commands: "${await res.text()}"`);

	console.log(`Processed successfully:\n${inspect(await res.json(), false, 6, true)}`);
}

const token = await getBearerToken();

await batchUpdateCommands(token);

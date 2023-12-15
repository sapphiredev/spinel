process.env.NODE_ENV ??= 'production';

import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { envParseString, setup } from '@skyra/env-utilities';
import {
	type APIApplicationCommand,
	ApplicationCommandPermissionType,
	OAuth2Routes,
	RouteBases,
	Routes,
	type RESTPostOAuth2ClientCredentialsResult
} from 'discord-api-types/v10';
import { stringify } from 'node:querystring';
import { inspect } from 'node:util';

setup({ path: new URL('../.env', import.meta.url) });

const ApplicationSecret = envParseString('DISCORD_APPLICATION_SECRET');
const ApplicationId = envParseString('DISCORD_CLIENT_ID');

if (!ApplicationId || !ApplicationSecret) {
	throw new Error('Please fill in all env variables in your ".env.local" file');
}

/**
 * Retrieves a client_credentials access token from the Discord OAUTH API
 * @returns The access token to be used
 */
async function getBearerToken(): Promise<string> {
	const body = await fetch<RESTPostOAuth2ClientCredentialsResult>(
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

/**
 * Updates permissions for the reload tags chat input command
 * @param token The authentication token from Discord
 * @param staffId The ID of the Sapphire Staff role
 * @param reloadTagsData The data from Discord for the reloadtags command
 */
async function allowSapphireStaffToUseCommand(token: string, staffId: string, reloadTagsData: APIApplicationCommand) {
	try {
		const res = await fetch(
			`${RouteBases.api}${Routes.applicationCommandPermissions(ApplicationId, '737141877803057244', reloadTagsData.id)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				method: FetchMethods.Put,
				body: JSON.stringify({
					permissions: [
						{
							id: staffId,
							type: ApplicationCommandPermissionType.Role,
							permission: true
						}
					]
				})
			},
			FetchResultTypes.JSON
		);

		console.log(`${inspect(res, false, 6, true)}\nSet permissions successfully\n==============\n`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Updates global chat input commands
 * @param token The authentication token from Discord
 */
async function getReloadTagsCommand(token: string) {
	try {
		const res = await fetch<APIApplicationCommand[]>(
			`${RouteBases.api}${Routes.applicationCommands(ApplicationId)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				method: FetchMethods.Get
			},
			FetchResultTypes.JSON
		);

		return res;
	} catch (error) {
		console.error(error);
	}
}

const token = await getBearerToken();

const allCommandsData = await getReloadTagsCommand(token);

if (allCommandsData) {
	const reloadTagCommand = allCommandsData.find((command) => command.name === 'reload-tags');

	if (reloadTagCommand) {
		await allowSapphireStaffToUseCommand(token, '868612689977569341', reloadTagCommand);
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_CLIENT_ID: string;
		DISCORD_APPLICATION_SECRET: string;
	}
}

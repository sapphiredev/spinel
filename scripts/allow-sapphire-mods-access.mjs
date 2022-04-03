process.env.NODE_ENV ??= 'production';

import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { ApplicationCommandPermissionType, OAuth2Routes, RouteBases, Routes } from 'discord-api-types/v10';
import { config } from 'dotenv-cra';
import { stringify } from 'node:querystring';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const ApplicationSecret = process.env.DISCORD_APPLICATION_SECRET;
const ApplicationId = process.env.DISCORD_CLIENT_ID;

if (!ApplicationId || !ApplicationSecret) {
	throw new Error('Please fill in all env variables in your ".env.local" file');
}

/**
 * Retrieves a client_credentials access token from the Discord OAUTH API
 * @returns {Promise<string>} The access token to be used
 */
async function getBearerToken() {
	/** @type {import('discord-api-types/v10').RESTPostOAuth2ClientCredentialsResult} */
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

/**
 * Updates permissions for the reload tags chat input command
 * @param {string} token The authentication token from Discord
 * @param {import('discord-api-types/v10').APIApplicationCommand} reloadTagsData The data from Discord for the reloadtags command
 */
async function allowSapphireStaffToUseReloadTags(token, reloadTagsData) {
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
							id: '868612689977569341',
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
 * @param {string} token The authentication token from Discord
 */
async function getReloadTagsCommand(token) {
	try {
		/** @type {Array<import('discord-api-types/v10').APIApplicationCommand>} */
		const res = await fetch(
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

		return res.find((command) => command.name === 'reload-tags');
	} catch (error) {
		console.error(error);
	}
}

const token = await getBearerToken();

const reloadTagCommand = await getReloadTagsCommand(token);

if (reloadTagCommand) {
	await allowSapphireStaffToUseReloadTags(token, reloadTagCommand);
}

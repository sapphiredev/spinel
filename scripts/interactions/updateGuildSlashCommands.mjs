process.env.NODE_ENV ??= 'development';

import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { ApplicationCommandPermissionType, OAuth2Routes, RouteBases, Routes } from 'discord-api-types/v9';
import { config } from 'dotenv-cra';
import { stringify } from 'node:querystring';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import commands from './commands.mjs';

const parsedCommands = commands.filter((command) => command.name !== 'reload-tags');

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const ApplicationSecret = process.env.DISCORD_APPLICATION_SECRET;
const ApplicationId = process.env.DISCORD_APPLICATION_ID;
const SapphireModeratorSnowflake = process.env.MODERATOR_ID;

if (!ApplicationId || !ApplicationSecret) {
	throw new Error('Please fill in all env variables in your ".env.local" file');
}

/**
 * @type string[]
 * @remark `737141877803057244` = Sapphire
 * @remark `838895946397646850` = Favna's testing server
 * @remark `541738403230777351` = Skyra Development Suite
 */
const guilds = ['737141877803057244', '838895946397646850', '541738403230777351'];

/**
 * Retrieves a client_credentials access token from the Discord OAUTH API
 * @returns {Promise<string>} The access token to be used
 */
async function getBearerToken() {
	/** @type {import('discord-api-types/v9').RESTPostOAuth2ClientCredentialsResult} */
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
 * @param {string} guildId The Guild that we're processing right now
 * @param {import('discord-api-types/v9').APIApplicationCommand} reloadTagsData The data from Discord for the reloadtags command
 */
async function allowAccessToReloadTags(token, guildId, reloadTagsData) {
	try {
		const res = await fetch(
			`${RouteBases.api}${Routes.applicationCommandPermissions(ApplicationId, guildId, reloadTagsData.id)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				method: FetchMethods.Put,
				body: JSON.stringify({
					permissions: [
						{
							id: SapphireModeratorSnowflake,
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
async function batchUpdateCommands(token) {
	for (const guild of guilds) {
		try {
			/** @type {Array<import('discord-api-types/v9').APIApplicationCommand>} */
			const res = await fetch(
				`${RouteBases.api}${Routes.applicationGuildCommands(ApplicationId, guild)}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					method: FetchMethods.Put,
					body: JSON.stringify(parsedCommands)
				},
				FetchResultTypes.JSON
			);

			console.log(`${inspect(res, false, 6, true)}\nBulk updated slash commands successfully\n==============\n`);

			const reloadTagsData = res.find((command) => command.name === 'reload-tags');
			if (reloadTagsData) {
				return await allowAccessToReloadTags(token, reloadTagsData);
			}
		} catch (error) {
			console.error(error);
		}
	}
}

const token = await getBearerToken();

await batchUpdateCommands(token);

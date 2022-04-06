import { FetchUserAgent } from '#constants/constants';
import { envParseString } from '#env/utils';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { OAuth2Routes, type RESTPostOAuth2ClientCredentialsResult } from 'discord-api-types/v10';
import { URLSearchParams } from 'node:url';

/**
 * Retrieves a client_credentials access token from the Discord OAUTH API
 * @returns The access token to be used
 */
export async function getBearerToken() {
	const body = await fetch<RESTPostOAuth2ClientCredentialsResult>(
		OAuth2Routes.tokenURL,
		{
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${envParseString('DISCORD_CLIENT_ID')}:${envParseString('DISCORD_APPLICATION_SECRET')}`
				).toString('base64')}`,
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': FetchUserAgent
			},
			body: new URLSearchParams({
				grant_type: 'client_credentials',
				scope: 'applications.commands.update'
			}).toString(),
			method: FetchMethods.Post
		},
		FetchResultTypes.JSON
	);

	if (!body.access_token) throw new Error(`Failed to fetch access token. Raw body: "${JSON.stringify(body)}"`);

	return body.access_token;
}

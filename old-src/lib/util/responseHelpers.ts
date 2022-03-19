import { HttpCodes } from '#api/HttpCodes';
import { FailPrefix } from '#constants/constants';
import type { FastifyResponse } from '#types/Api';
import {
	type APIApplicationCommandAutocompleteResponse,
	type APIApplicationCommandOptionChoice,
	type APIInteractionResponse,
	type APIInteractionResponseChannelMessageWithSource,
	type APIInteractionResponseUpdateMessage,
	type APISelectMenuOption,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	type Snowflake
} from 'discord-api-types/v9';
import type { FastifyReply } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';

export function interactionResponse({
	content,
	ephemeral = false,
	users = [],
	extraData
}: ResponseParameters): APIInteractionResponseChannelMessageWithSource {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content,
			flags: ephemeral ? MessageFlags.Ephemeral : 0,
			allowed_mentions: { users },
			...extraData
		}
	};
}

export function updateResponse({ content, ephemeral = false, users = [], extraData }: ResponseParameters): APIInteractionResponseUpdateMessage {
	return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			content,
			flags: ephemeral ? MessageFlags.Ephemeral : 0,
			allowed_mentions: { users },
			...extraData
		}
	};
}

export function selectMenuResponse({ customId, selectMenuOptions, ...parameters }: SelectMenuParameters): APIInteractionResponse {
	return interactionResponse({
		...parameters,
		ephemeral: true,
		extraData: {
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.SelectMenu,
							custom_id: customId,
							options: selectMenuOptions
						}
					]
				}
			]
		}
	});
}

export function interactionResponseAutocomplete({ choices }: ResponseAutoCompleteParameters): APIApplicationCommandAutocompleteResponse {
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices
		}
	};
}

export function errorResponse({ content, ...parameters }: ResponseParameters): APIInteractionResponse {
	return interactionResponse({ ...parameters, content: `${FailPrefix} ${content}`, ephemeral: true });
}

export function sendJson<T>(
	response: FastifyReply<Server, IncomingMessage, ServerResponse, RouteGenericInterface, T>,
	body: T,
	statusCode: HttpCodes = HttpCodes.OK
) {
	return response.status(statusCode).send(body);
}

export function noResultsErrorResponse(response: FastifyResponse) {
	return sendJson(
		response,
		errorResponse({
			content: 'I was not able to find anything with provided parameters.'
		})
	);
}

interface ResponseParameters {
	content: string;
	ephemeral?: boolean;
	users?: Snowflake[];
	extraData?: APIInteractionResponseChannelMessageWithSource['data'];
}

interface ResponseAutoCompleteParameters {
	choices: APIApplicationCommandOptionChoice[];
}

interface SelectMenuParameters extends Omit<ResponseParameters, 'ephemeral' | 'extraData'> {
	selectMenuOptions: APISelectMenuOption[];
	customId: string;
}

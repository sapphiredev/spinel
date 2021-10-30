import { HttpCodes } from '#api/HttpCodes';
import { FailPrefix } from '#constants/constants';
import type { APIInteractionResponse, APIInteractionResponseChannelMessageWithSource, APISelectMenuOption, Snowflake } from 'discord-api-types/v9';
import { ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v9';
import type { FastifyReply } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';

export function interactionResponse({
	content,
	ephemeral = false,
	users = [],
	type = InteractionResponseType.ChannelMessageWithSource,
	extraData
}: ResponseParameters): APIInteractionResponse {
	return {
		type,
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

interface ResponseParameters {
	content: string;
	type?: InteractionResponseType;
	ephemeral?: boolean;
	users?: Snowflake[];
	extraData?: APIInteractionResponseChannelMessageWithSource['data'];
}

interface SelectMenuParameters extends Omit<ResponseParameters, 'ephemeral' | 'extraData'> {
	selectMenuOptions: APISelectMenuOption[];
	customId: string;
}

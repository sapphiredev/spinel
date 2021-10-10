import {
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	APISelectMenuOption,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	Snowflake
} from 'discord-api-types/v9';
import { FailPrefix } from '../constants/constants';

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

import { SupportServerButton } from '#constants/constants';
import { errorResponse } from '#utils/response-utils';
import { findTag } from '#utils/tags';
import { ActionRowBuilder, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { MessageComponentHandler, postMessage } from '@skyra/http-framework';
import type { APIMessageComponentInteraction, APIMessageSelectMenuInteractionData, Snowflake } from 'discord-api-types/v10';

export class UserMessageComponentHandler extends MessageComponentHandler {
	public run(interaction: APIMessageComponentInteraction, [customIdValue]: [Snowflake | null]) {
		const content = findTag((interaction.data as APIMessageSelectMenuInteractionData).values[0], customIdValue ?? undefined);

		if (!content) {
			return this.updateMessage(
				errorResponse({
					content: 'I failed to find the selected tag. Try again or contact the developer.',
					components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(SupportServerButton).toJSON()]
				})
			);
		}

		return {
			response: this.updateMessage({ content: 'Tag sent', components: [] }),
			callback: () => {
				void postMessage(interaction, {
					content,
					allowed_mentions: {
						users: customIdValue ? [customIdValue] : []
					}
				});
			}
		};
	}
}

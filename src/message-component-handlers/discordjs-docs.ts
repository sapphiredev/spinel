import { SupportServerButton } from '#constants/constants';
import { fetchDocResult, fetchDocs } from '#utils/discordjs-docs';
import { errorResponse } from '#utils/response-utils';
import { ActionRowBuilder, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { MessageComponentHandler, postMessage } from '@skyra/http-framework';
import type { APIMessageComponentInteraction, APIMessageSelectMenuInteractionData, Snowflake } from 'discord-api-types/v10';
import type { SourcesStringUnion } from 'discordjs-docs-parser';

export class UserMessageComponentHandler extends MessageComponentHandler {
	public async run(interaction: APIMessageComponentInteraction, [customIdValue, source]: [Snowflake | null, SourcesStringUnion]) {
		const doc = await fetchDocs(source);

		const selectedValue = (interaction.data as APIMessageSelectMenuInteractionData).values[0];
		const content = fetchDocResult({ source, doc, query: selectedValue, target: customIdValue ?? undefined });

		if (!content) {
			return this.updateMessage(
				errorResponse({
					content: 'I failed to find the selected discord.js documentation entry. Try again or contact the developer.',
					components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(SupportServerButton).toJSON()]
				})
			);
		}

		return {
			response: this.updateMessage({ content: 'Docs query sent', components: [] }),
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

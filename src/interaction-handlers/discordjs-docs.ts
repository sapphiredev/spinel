import { SupportServerButton } from '#constants/constants';
import { fetchDocResult, fetchDocs } from '#utils/discordjs-docs';
import { errorResponse } from '#utils/response-utils';
import { ActionRowBuilder, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { InteractionHandler, postMessage } from '@skyra/http-framework';
import type { APIMessageSelectMenuInteractionData, Snowflake } from 'discord-api-types/v10';
import type { SourcesStringUnion } from 'discordjs-docs-parser';

export class UserInteractionHandler extends InteractionHandler {
	public async *run(interaction: InteractionHandler.MessageComponentInteraction, [customIdValue, source]: [Snowflake | null, SourcesStringUnion]) {
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

		yield this.updateMessage({ content: 'Docs query sent', components: [] });

		await postMessage(interaction, {
			content,
			allowed_mentions: {
				users: customIdValue ? [customIdValue] : []
			}
		});

		return undefined;
	}
}

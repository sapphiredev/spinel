import { SupportServerButton } from '#constants/constants';
import { fetchDocResult, fetchDocs } from '#utils/discordjs-docs';
import { errorResponse } from '#utils/response-utils';
import { postMessage } from '#utils/utils';
import { ActionRowBuilder, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { InteractionHandler } from '@skyra/http-framework';
import type { Snowflake } from 'discord-api-types/v10';
import type { SourcesStringUnion } from 'discordjs-docs-parser';

export class UserInteractionHandler extends InteractionHandler {
	public async run(interaction: InteractionHandler.SelectMenuInteraction, [customIdValue, source]: [Snowflake | null, SourcesStringUnion]) {
		const doc = await fetchDocs(source);

		const selectedValue = interaction.values[0];
		const content = fetchDocResult({ source, doc, query: selectedValue, target: customIdValue ?? undefined });

		if (!content) {
			return interaction.reply(
				errorResponse({
					content: 'I failed to find the selected discord.js documentation entry. Try again or contact the developer.',
					components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([SupportServerButton]).toJSON()]
				})
			);
		}

		await interaction.update({ content: 'Docs query sent', components: [] });

		// return interaction.followup({
		// 	content,
		// 	allowed_mentions: {
		// 		users: customIdValue ? [customIdValue] : []
		// 	}
		// });

		return postMessage(interaction, {
			content,
			allowed_mentions: {
				users: customIdValue ? [customIdValue] : []
			}
		});
	}
}

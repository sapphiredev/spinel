import { SupportServerButton } from '#constants/constants';
import { errorResponse } from '#utils/response-utils';
import { findTag } from '#utils/tags';
// import { postMessage } from '#utils/utils';
import { ActionRowBuilder, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { InteractionHandler } from '@skyra/http-framework';
import type { Snowflake } from 'discord-api-types/v10';

export class UserMessageComponentHandler extends InteractionHandler {
	public async run(interaction: InteractionHandler.SelectMenuInteraction, [customIdValue]: [Snowflake | null]) {
		const content = findTag(interaction.values[0], customIdValue ?? undefined);

		if (!content) {
			return interaction.reply(
				errorResponse({
					content: 'I failed to find the selected tag. Try again or contact the developer.',
					components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([SupportServerButton]).toJSON()]
				})
			);
		}

		await interaction.update({ content: 'Tag sent', components: [] });

		return interaction.followup({
			content,
			allowed_mentions: {
				users: customIdValue ? [customIdValue] : []
			}
		});
	}
}

import { FetchUserAgent, SupportServerButton } from '#constants/constants';
import { fetchDocResult, fetchDocs } from '#utils/discordjs-docs';
import { errorResponse } from '#utils/response-utils';
import { ActionRowBuilder, type MessageActionRowComponentBuilder } from '@discordjs/builders';
import { fetch, FetchMethods } from '@sapphire/fetch';
import { MessageComponentHandler } from '@skyra/http-framework';
import {
	RouteBases,
	Routes,
	type APIMessageComponentInteraction,
	type APIMessageSelectMenuInteractionData,
	type Snowflake
} from 'discord-api-types/v10';
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
			callback: async () => {
				await fetch(`${RouteBases.api}${Routes.webhook(interaction.application_id, interaction.token)}`, {
					method: FetchMethods.Post,
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': FetchUserAgent
					},
					body: JSON.stringify({
						content,
						allowed_mentions: { users: customIdValue ? [customIdValue] : [] }
					})
				});
			}
		};
	}
}

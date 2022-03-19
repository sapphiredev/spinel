import { FailPrefix, FetchUserAgent, SupportServerButton } from '#constants/constants';
import { findTag } from '#utils/tags';
import { fetch, FetchMethods } from '@sapphire/fetch';
import { MessageComponentHandler } from '@skyra/http-framework';
import {
	ComponentType,
	RouteBases,
	Routes,
	type APIMessageComponentInteraction,
	type APIMessageSelectMenuInteractionData,
	type Snowflake
} from 'discord-api-types/v9';

export class UserMessageComponentHandler extends MessageComponentHandler {
	public run(interaction: APIMessageComponentInteraction, [customIdValue]: [Snowflake | null]) {
		const content = findTag((interaction.data as APIMessageSelectMenuInteractionData).values[0], customIdValue ?? undefined);

		if (!content) {
			return this.updateMessage({
				content: `${FailPrefix} Failed to send tag. Try again or contact the developer.`,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [SupportServerButton]
					}
				]
			});
		}

		return {
			response: this.updateMessage({ content: 'Tag sent', components: [] }),
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

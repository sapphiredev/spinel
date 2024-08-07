import { errorResponse } from '#utils/response-utils';
import { loadTags, tagCache } from '#utils/tags';
import { getGuildIds } from '#utils/utils';
import { roleMention, userMention } from '@discordjs/builders';
import { Command, RegisterCommand, RestrictGuildIds } from '@skyra/http-framework';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';

@RegisterCommand((builder) =>
	builder //
		.setName('reload-tags')
		.setDescription('Reload the tags cache in memory. This can only be used by Sapphire staff.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.Interaction) {
		if (!interaction.member) {
			return interaction.reply(
				errorResponse({
					content: 'this command can only be used in the Sapphire server.'
				})
			);
		}

		if (!interaction.member.roles.includes('868612689977569341')) {
			return interaction.reply(
				errorResponse({
					content: `You need to have the Sapphire ${roleMention('868612689977569341')} role to use this command.`
				})
			);
		}

		try {
			tagCache.clear();
			await loadTags();

			return interaction.reply({
				content: 'Successfully reloaded all tags',
				flags: MessageFlags.Ephemeral
			});
		} catch {
			return interaction.reply(
				errorResponse({
					content: `something went wrong reloading the tags. Better contact ${userMention('268792781713965056')}`
				})
			);
		}
	}
}

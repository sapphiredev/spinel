import { errorResponse } from '#utils/response-utils';
import { getGuildIds } from '#utils/utils';
import { bold, roleMention } from '@discordjs/builders';
import { filterNullish, inlineCodeBlock } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import { Command, RegisterCommand, RestrictGuildIds } from '@skyra/http-framework';
import { MessageFlags } from 'discord-api-types/v10';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeHeapSnapshot } from 'node:v8';

@RegisterCommand((builder) =>
	builder //
		.setName('heapsnapshot')
		.setDescription('Dumps a heap snapshot. This can only be used by Sapphire staff.')
		.setDefaultPermission(false)
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	#rootFolder = new URL('../../', import.meta.url);

	public override async *chatInputRun(interaction: Command.Interaction) {
		if (!interaction.member) {
			return this.message(
				errorResponse({
					content: 'this command can only be used in the Sapphire server.'
				})
			);
		}

		if (!interaction.member.roles.includes('868612689977569341')) {
			return this.message(
				errorResponse({
					content: `You need to have the Sapphire ${roleMention('868612689977569341')} role to use this command.`
				})
			);
		}

		yield this.defer({ flags: MessageFlags.Ephemeral });

		// Capture the snapshot (this freezes the entire VM)
		const fileName = writeHeapSnapshot();

		const outputMessage = [
			//
			`Heapsnapshot stored at ${inlineCodeBlock(fileName)}!`,
			envParseString('NODE_ENV') === 'production'
				? `\nThis file can be extracted from the Docker container using the following command: ${inlineCodeBlock(
						`docker cp skyra:${join(fileURLToPath(this.#rootFolder), fileName)} ./${fileName}`
				  )}`
				: null,
			`\nRemember, do ${bold('NOT')} share this with anybody, it may contain a lot of sensitive data.`
		]
			.filter(filterNullish)
			.join('\n');

		await this.editReply(interaction, {
			data: {
				content: outputMessage
			}
		});

		return undefined;
	}
}

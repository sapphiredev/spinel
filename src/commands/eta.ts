import { getGuildIds } from '#utils/utils';
import { hideLinkEmbed, hyperlink, inlineCode, time, TimestampStyles } from '@discordjs/builders';
import { Command, RegisterCommand, RestrictGuildIds } from '@skyra/http-framework';
import { addDays, addMonths } from 'date-fns';

const enum Eta {
	V4 = 'v4'
}

@RegisterCommand((builder) =>
	builder //
		.setName('eta')
		.setDescription('Gives you the ETA until @sapphire/framework v3 and v4 will release')
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.Interaction) {
		const etaToV4 = await this.getEta(Eta.V4);

		const timeParsedEtaV4 = time(etaToV4, TimestampStyles.RelativeTime);
		const frameworkLink = hyperlink(inlineCode('@sapphire/framework'), hideLinkEmbed('https://github.com/sapphiredev/framework'));

		const newEtaV4 = addDays(etaToV4, 4);

		await this.setEta(newEtaV4, Eta.V4);

		return interaction.reply({
			content: `${frameworkLink} Version 4 will be releasing ${timeParsedEtaV4}`
		});
	}

	private async getEta(eta: Eta): Promise<Date> {
		const etaFromRedis = await this.container.redisClient.get(`eta-${eta}`);

		return etaFromRedis ? new Date(Number(etaFromRedis)) : addMonths(new Date(), 4);
	}

	private async setEta(newEta: Date, eta: Eta): Promise<void> {
		await this.container.redisClient.set(`eta-${eta}`, newEta.getTime().toString());
	}
}

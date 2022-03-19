import { BrandingColors, SupportServerButton } from '#constants/constants';
import { envParseString } from '#env/utils';
import { getGuildIds } from '#utils/utils';
import { Embed, hideLinkEmbed, hyperlink, time, TimestampStyles } from '@discordjs/builders';
import { roundNumber } from '@sapphire/utilities';
import { Command, RegisterCommand, RestrictGuildIds } from '@skyra/http-framework';
import { APIActionRowComponent, APIInteractionResponse, ButtonStyle, ComponentType, MessageFlags } from 'discord-api-types/v9';
import { cpus, uptime, type CpuInfo } from 'node:os';

@RegisterCommand((builder) =>
	builder //
		.setName('info')
		.setDescription('Provides information about this application, and links for adding it and joining the support server')
)
@RestrictGuildIds(getGuildIds())
export class UserCommand extends Command {
	readonly #descriptionContent = [
		`Sapphire Application Commands is a utility bot for the ${hyperlink('Sapphire discord server', 'discord.gg/sapphiredev')} server.`,
		`This is an HTTP-only bot that uses the ${hyperlink(
			'Skyra HTTP Framework',
			hideLinkEmbed('https://www.npmjs.com/package/@skyra/http-framework')
		)} build on top of ${hyperlink('discord-api-types', hideLinkEmbed('https://www.npmjs.com/package/discord-api-types'))}.`
	].join('\n');

	readonly #intlNumberFormatter = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

	public override chatInputRun(): APIInteractionResponse {
		return this.message({
			flags: MessageFlags.Ephemeral,
			embeds: [this.embed],
			components: this.components
		});
	}

	private get components(): APIActionRowComponent[] {
		return [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						url: this.inviteLink,
						label: 'Add me to your server!',
						emoji: { name: '🎉' }
					},
					SupportServerButton
				]
			},
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						url: 'https://github.com/sapphiredev/sapphire-application-commands',
						label: 'GitHub Repository',
						emoji: { id: '950888087188283422', name: 'github2' }
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						url: 'https://github.com/sponsors/sapphiredev',
						label: 'Donate',
						emoji: { name: '🧡' }
					}
				]
			}
		];
	}

	private get inviteLink() {
		return `https://discord.com/api/oauth2/authorize?client_id=${envParseString('DISCORD_CLIENT_ID')}&scope=applications.commands`;
	}

	private get embed(): Embed {
		const titles = {
			uptime: 'Uptime',
			serverUsage: 'Server Usage'
		};
		const uptime = this.uptimeStatistics;
		const usage = this.usageStatistics;

		const fields = {
			uptime: [
				//
				`• **Host**: ${uptime.host}`,
				`• **Process**: ${uptime.process}`
			].join('\n'),
			serverUsage: [
				//
				`• **CPU Load**: ${usage.cpuLoad}`,
				`• **Heap**: ${usage.ramUsed}MB (Total: ${usage.ramTotal}MB)`
			].join('\n')
		};

		return new Embed() //
			.setColor(BrandingColors.Primary)
			.setDescription(this.#descriptionContent)
			.addFields(
				{
					name: titles.uptime,
					value: fields.uptime
				},
				{
					name: titles.serverUsage,
					value: fields.serverUsage
				}
			);
	}

	private get uptimeStatistics(): StatsUptime {
		const now = Date.now();
		const nowSeconds = roundNumber(now / 1000);
		return {
			host: time(roundNumber(nowSeconds - uptime()), TimestampStyles.RelativeTime),
			process: time(roundNumber(nowSeconds - process.uptime()), TimestampStyles.RelativeTime)
		};
	}

	private get usageStatistics(): StatsUsage {
		const usage = process.memoryUsage();
		return {
			cpuLoad: cpus().slice(0, 2).map(UserCommand.formatCpuInfo.bind(null)).join(' | '),
			ramTotal: this.#intlNumberFormatter.format(usage.heapTotal / 1048576),
			ramUsed: this.#intlNumberFormatter.format(usage.heapUsed / 1048576)
		};
	}

	private static formatCpuInfo({ times }: CpuInfo) {
		return `${roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}
}

interface StatsUptime {
	host: string;
	process: string;
}

interface StatsUsage {
	cpuLoad: string;
	ramTotal: string;
	ramUsed: string;
}

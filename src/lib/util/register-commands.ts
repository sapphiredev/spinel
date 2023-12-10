import { envParseString } from '@skyra/env-utilities';
import { applicationCommandRegistry } from '@skyra/http-framework';

export async function registerCommands() {
	if (envParseString('NODE_ENV') === 'development') {
		await applicationCommandRegistry.pushGuildRestrictedCommands();
	} else {
		await applicationCommandRegistry.pushGlobalCommands();
	}
}

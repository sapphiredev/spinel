import { envParseString } from '@skyra/env-utilities';
import { Registry } from '@skyra/http-framework';

export async function registerCommands() {
	const registry = new Registry({});

	if (envParseString('NODE_ENV') === 'development') {
		await registry.registerGuildRestrictedCommands();
	} else {
		await registry.registerGlobalCommands();
	}
}

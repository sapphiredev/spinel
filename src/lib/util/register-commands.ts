import { getBearerToken } from '#utils/get-token';
import { envParseString } from '@skyra/env-utilities';
import { Registry } from '@skyra/http-framework';

export async function registerCommands() {
	const token = await getBearerToken();

	const registry = new Registry({ token, authPrefix: 'Bearer' });

	if (envParseString('NODE_ENV') === 'development') {
		await registry.registerGuildRestrictedCommands();
	} else {
		await registry.registerGlobalCommands();
	}
}

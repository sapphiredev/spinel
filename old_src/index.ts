import { APIApplicationCommandInteraction, APIInteraction, InteractionResponseType, InteractionType } from 'discord-api-types/v8';
import { createJSONResponse } from './lib/utils/createJSONResponse';
import { router } from './lib/utils/Router';
import { verifyDiscordInteraction } from './lib/utils/verifyDiscordInteraction';
import { ping } from './commands/ping';

router.post('/slash-commands', async (req) => {
	const interactionInvalid = await verifyDiscordInteraction(req);
	if (interactionInvalid) return interactionInvalid;

	const json: APIInteraction = await req.json();

	if (json.type === InteractionType.Ping) return createJSONResponse({ type: InteractionResponseType.Pong });

	const casted = json as APIApplicationCommandInteraction;

	switch (casted.data.name) {
		case 'ping':
			return ping(casted);
	}

	return createJSONResponse({ code: 404, message: 'Not found' }, { status: 404 });
});

addEventListener('fetch', (event) => {
	event.respondWith(router.route(event.request, event));
});

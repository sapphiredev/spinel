import type { APIInteractionResponse } from 'discord-api-types/v8';
import { createJSONResponse } from './createJSONResponse';

export function createCommandResponse(data: APIInteractionResponse) {
	return createJSONResponse(data);
}

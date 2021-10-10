import type { APIInteractionResponse } from 'discord-api-types/v9';
import { errorResponse, interactionResponse } from '../lib/util/responseHelpers';
import { loadTags, tagCache } from '../lib/util/tags';

export async function reloadTags(): Promise<APIInteractionResponse> {
	const prev = tagCache.size;
	tagCache.clear();

	try {
		await loadTags();
		return interactionResponse({
			content: `Tags have fully reloaded! Tag cache size has changed from ${prev} to ${tagCache.size}.`,
			ephemeral: true
		});
	} catch (error) {
		return errorResponse({
			content: `Something went wrong while loading tags\n\`${(error as Error).message}\``
		});
	}
}

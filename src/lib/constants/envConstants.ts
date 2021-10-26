import { DiscordDeveloperDocsAlgoliaApplicationId, DjsGuideAlgoliaApplicationId } from '#utils/env';

export const DjsGuideAlgoliaUrl = `https://${DjsGuideAlgoliaApplicationId}.algolia.net/1/indexes/discordjs/query` as const;
export const DiscordDeveloperDocsAlgoliaUrl = `https://${DiscordDeveloperDocsAlgoliaApplicationId}.algolia.net/1/indexes/discord/query` as const;

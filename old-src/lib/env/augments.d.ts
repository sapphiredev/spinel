import type { SapphireSlashiesEnv } from './types';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends SapphireSlashiesEnv {}
	}
}

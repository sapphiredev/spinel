import type { VercelRequest } from '@vercel/node';
import { sign } from 'tweetnacl';
import { PublicKeyBuffer } from './constants';
import { HttpCodes } from './HttpCodes';

export function verifyDiscordInteraction(req: VercelRequest): VerifyDiscordInteractionResponse | null {
	const { headers } = req;
	const signatureHeader = headers['x-signature-ed25519'];
	const timestampHeader = headers['x-signature-timestamp'];

	if (!signatureHeader || !timestampHeader) {
		return {
			statusCode: HttpCodes.BadRequest,
			message: 'Bad request',
			statusText: 'Bad request'
		};
	}

	const body = timestampHeader + JSON.stringify(req.body);

	const isVerified = sign.detached.verify(
		Buffer.from(body), //
		Buffer.from(signatureHeader, 'hex'),
		PublicKeyBuffer
	);

	if (!isVerified) {
		return {
			statusCode: HttpCodes.Unauthorized,
			message: 'Unauthorized',
			statusText: 'Unauthorized'
		};
	}

	return null;
}

export interface VerifyDiscordInteractionResponse {
	statusCode: HttpCodes;
	message: string;
	statusText?: string;
}

declare module 'http' {
	interface IncomingHttpHeaders {
		'x-signature-ed25519'?: string;
		'x-signature-timestamp'?: string;
	}
}

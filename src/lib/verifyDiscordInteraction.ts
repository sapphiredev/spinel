import type { VercelRequest } from '@vercel/node';
import { sign } from 'tweetnacl';
import { DiscordPublicKeyBuffer } from './env';
import { HttpCodes } from './HttpCodes';

export function verifyDiscordInteraction(req: VercelRequest): VerifyDiscordInteractionResponse | null {
	const { headers } = req;
	console.error(headers);
	const signatureHeader = headers['X-Signature-Ed25519'];
	const timestampHeader = headers['X-Signature-Timestamp'];

	if (!signatureHeader || !timestampHeader) {
		return {
			statusCode: HttpCodes.BadRequest,
			message: 'are you actually Discord sending me a request, or is Discord trolling me by sending Bad Requests?'
		};
	}

	const body = timestampHeader + JSON.stringify(req.body);

	const isVerified = sign.detached.verify(
		Buffer.from(body), //
		Buffer.from(signatureHeader, 'hex'),
		DiscordPublicKeyBuffer
	);

	if (!isVerified) {
		return {
			statusCode: HttpCodes.Unauthorized,
			message: "you're very much unauthorized you naughty naughty thing."
		};
	}

	return null;
}

export interface VerifyDiscordInteractionResponse {
	statusCode: HttpCodes;
	message: string;
}

declare module 'http' {
	interface IncomingHttpHeaders {
		'X-Signature-Ed25519'?: string;
		'X-Signature-Timestamp'?: string;
	}
}

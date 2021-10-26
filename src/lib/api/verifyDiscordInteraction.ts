import { HttpCodes } from '#api/HttpCodes';
import type { FastifyRequest } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { IncomingMessage, Server } from 'node:http';
import tweetnacl from 'tweetnacl';

export function verifyDiscordInteraction(
	req: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>
): VerifyDiscordInteractionResponse | null {
	const { headers } = req;
	const signatureHeader = headers['x-signature-ed25519'];
	const timestampHeader = headers['x-signature-timestamp'];

	if (!signatureHeader || !timestampHeader) {
		return {
			statusCode: HttpCodes.Unauthorized,
			message: 'Are you actually Discord sending me a request, or is Discord trolling me by sending Bad Requests?'
		};
	}

	const body = timestampHeader + JSON.stringify(req.body);

	const isVerified = tweetnacl.sign.detached.verify(
		Buffer.from(body), //
		Buffer.from(signatureHeader, 'hex'),
		Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
	);

	if (!isVerified) {
		return {
			statusCode: HttpCodes.Unauthorized,
			message: "You're very much unauthorized you naughty, naughty thing."
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
		'x-signature-ed25519'?: string;
		'x-signature-timestamp'?: string;
	}
}

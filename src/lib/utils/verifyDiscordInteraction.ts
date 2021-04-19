import { sign } from 'tweetnacl';
import { createJSONResponse } from './createJSONResponse';

export async function verifyDiscordInteraction(req: Request) {
	const { headers } = req;
	const signatureHeader = headers.get('X-Signature-Ed25519');
	const timestampHeader = headers.get('X-Signature-Timestamp');

	if (!signatureHeader || !timestampHeader)
		return createJSONResponse(
			{
				code: 400,
				message: 'Bad request'
			},
			{
				status: 400,
				statusText: 'Bad request'
			}
		);

	const body = timestampHeader + (await req.clone().text());

	const isVerified = sign.detached.verify(
		Buffer.from(body), //
		Buffer.from(signatureHeader, 'hex'),
		Buffer.from(process.env.PUBLIC_KEY!, 'hex')
	);

	if (!isVerified)
		return createJSONResponse(
			{
				code: 401,
				message: 'Unauthorized'
			},
			{
				status: 401,
				statusText: 'Unauthorized'
			}
		);

	return null;
}

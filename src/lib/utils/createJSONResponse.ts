export function objectToJSON<T>(input: T): string {
	return JSON.stringify(input);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createJSONResponse<T extends {}>(input: T, options?: ResponseInit) {
	return new Response(objectToJSON(input), {
		...options,
		headers: {
			...(options?.headers ?? {}),
			'content-type': 'application/json'
		}
	});
}

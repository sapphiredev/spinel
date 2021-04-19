import { createJSONResponse } from './createJSONResponse';

/**
 * A router handler function
 */
export interface RouterHandlerFunction {
	(request: Request, event: FetchEvent): Promise<Response>;
}

/**
 * A router condition
 */
export interface RouterCondition {
	(request: Request): boolean | Promise<boolean>;
}

/**
 * Internal router route
 */
export interface Route {
	conditions?: RouterCondition[];
	handler: RouterHandlerFunction;
}

const MethodIs = (method: string): RouterCondition => (req: Request) => req.method.toLowerCase() === method.toLowerCase();

const PathIs = (expectedRoute: string | RegExp): RouterCondition => (req: Request) => {
	const url = new URL(req.url);
	const path = url.pathname;

	const matchResult = path.match(expectedRoute);

	return matchResult?.[0] === path ?? false;
};

export const router = new (class Router {
	private routes: Route[] = [];

	public get(url: string, handler: RouterHandlerFunction) {
		return this.handle('get', url, handler);
	}

	public post(url: string, handler: RouterHandlerFunction) {
		return this.handle('post', url, handler);
	}

	public put(url: string, handler: RouterHandlerFunction) {
		return this.handle('put', url, handler);
	}

	public patch(url: string, handler: RouterHandlerFunction) {
		return this.handle('patch', url, handler);
	}

	public delete(url: string, handler: RouterHandlerFunction) {
		return this.handle('delete', url, handler);
	}

	// this route accepts any method
	public any(url: string, handler: RouterHandlerFunction) {
		this.routes.push({ conditions: [PathIs(url)], handler });
		return this;
	}

	// this is a 404 route
	public all(handler: RouterHandlerFunction) {
		this.routes.push({ conditions: [], handler });
		return this;
	}

	public async route(req: Request, event: FetchEvent): Promise<Response> {
		const route = await this.resolve(req);
		if (route) {
			try {
				return await route.handler(req, event);
			} catch (err) {
				return createJSONResponse(
					{
						code: 500,
						message: err.message
					},
					{
						status: 500,
						statusText: 'Internal Server Error'
					}
				);
			}
		}

		return createJSONResponse(
			{
				code: 404,
				error: 'Resource not found'
			},
			{
				status: 404,
				statusText: 'Resource not found'
			}
		);
	}

	private handle(method: string, url: string, handler: RouterHandlerFunction) {
		this.routes.push({
			conditions: [MethodIs(method), PathIs(url)],
			handler
		});
		return this;
	}

	// resolve returns the matching route, if any
	private async resolve(req: Request) {
		for (const route of this.routes) {
			if (!route.conditions?.length) return route;

			const conditionChecks = await Promise.all(route.conditions.map((fun) => fun(req)));
			if (conditionChecks.every((item) => item)) {
				return route;
			}
		}

		return null;
	}
})();

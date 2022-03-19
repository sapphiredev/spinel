import type { FastifyReply } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { IncomingMessage, Server, ServerResponse } from 'http';

export type FastifyResponse = FastifyReply<Server, IncomingMessage, ServerResponse, RouteGenericInterface, unknown>;

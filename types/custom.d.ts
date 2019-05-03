import * as fastify from 'fastify';
import * as http from 'http';
import * as http2 from 'http2';

declare module 'fastify' {
	export interface FastifyInstance<
		HttpServer = http.Server,
		HttpRequest = http.IncomingMessage,
		HttpResponse = http.ServerResponse
	> {
		blipp(): void;
	}
}

// import * as fastify from 'fastify';
// import {Server, IncomingMessage, ServerResponse} from 'http';
// import * as http2 from 'http2';

// declare module 'fastify' {
// 	export interface FastifyInstance<
// 		Server,
// 		IncomingMessage,
// 		ServerResponse
// 	> {
// 		blipp(): void;
// 		ws(): any;
// 	}
// }

declare module 'fastify-ws';
declare module 'fastify-blipp';
declare module 'nanoid';
declare module 'nanoid/generate';
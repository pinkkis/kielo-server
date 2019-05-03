import 'reflect-metadata';
import 'dotenv';

import { container } from 'tsyringe';
import { RoomService } from './services/RoomService';
import * as fastify from 'fastify';
import * as fs from 'fs';
import { resolve } from 'path';
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2';
import * as fastifyBlipp from 'fastify-blipp';
import { routes } from './routes';

const PORT = Number(process.env.SERVER_PORT) || 3000;

const fastifyOptions: fastify.ServerOptionsAsSecureHttp2 = {
	http2: true,
	https: {
		allowHTTP1: true,
		key: fs.readFileSync(
			resolve(__dirname, '..', 'certificates', 'key.pem'),
		),
		cert: fs.readFileSync(
			resolve(__dirname, '..', 'certificates', 'cert.pem'),
		),
	},
	logger: true,
};

const roomService = container.resolve(RoomService);
const server: fastify.FastifyInstance<
	Http2Server,
	Http2ServerRequest,
	Http2ServerResponse
> = fastify(fastifyOptions);

server.register(fastifyBlipp);

routes.forEach( r => {
	server.register(r);
});

const start = async () => {
	try {
		await server.listen(PORT);
		(server as any).blipp();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

process.on('uncaughtException', error => {
	console.error(error);
});

process.on('unhandledRejection', error => {
	console.error(error);
});

start();

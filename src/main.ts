import 'reflect-metadata';
import 'dotenv';

import { container } from 'tsyringe';
import { RoomService } from './services/RoomService';
import * as fastify from 'fastify';
import * as fs from 'fs';
import { resolve } from 'path';
import * as fastifyBlipp from 'fastify-blipp';
import * as fastifyStatic from 'fastify-static';
import * as fastifyWs from 'fastify-ws';

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
	logger: {
		prettyPrint: true,
	},
	ignoreTrailingSlash: true,
};

const server = fastify(fastifyOptions);

server.register(fastifyWs);
server.register(fastifyStatic, {
	root: resolve(__dirname, '..', 'public'),
	wildcard: true,
});
server.register(fastifyBlipp);

routes.forEach( r => {
	server.register(r);
});

server.ready( (err: Error) => {
	if (err) {
		throw err;
	}

	(server as any).ws
		.on('connection', (socket) => {
			console.log('Client connected');

			socket.on('message', (msg: any) => {
				console.log('Client message: ', msg);
			});

			socket.on('close', () => {
				console.log('Client disconnected');
			});
		})
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

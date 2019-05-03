import 'reflect-metadata';
import 'dotenv';

import { container } from 'tsyringe';
import { RoomService } from './services/RoomService';
import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import { resolve } from 'path';
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2';

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
};

const roomService = container.resolve(RoomService);
const server: fastify.FastifyInstance<
	Http2Server,
	Http2ServerRequest,
	Http2ServerResponse
> = fastify(fastifyOptions);

server.get('/', async (req, res) => {
	res.code(200).send({ hello: 'world' });
});

server.listen(PORT, (err: Error, address: string) => {
	if (err) {
		console.error(err);
	}

	console.log('listening on ' + address);
});

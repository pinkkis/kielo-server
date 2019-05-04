import * as fp from 'fastify-plugin';
import { API_ROOT } from 'src/config';

export const rootRoute = fp(async (server, opts, next) => {
	server.route({
		method: 'GET',
		url: API_ROOT,
		handler: (req, res) => {
			res.send({ hello: 'world' });
		},
	});
	next();
});

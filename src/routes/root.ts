import * as fp from 'fastify-plugin';

export const rootRoute = fp(async (server, opts, next) => {
	server.route({
		method: 'GET',
		url: '/',
		schema: {
			response: {
				200: {
					type: 'object',
					properties: {
						hello: { type: 'string' },
					},
				},
			},
		},
		handler: (req, res) => {
			res.send({ hello: 'world' });
		},
	});
	next();
});

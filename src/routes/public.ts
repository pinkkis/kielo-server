import * as fp from 'fastify-plugin';

export const index = fp(async (server, opts, next) => {
	server.get('/', (req, res) => {
		res.sendFile('index.html');
	});
});

// export const index = fp(async (server, opts, next) => {
// 	server.route({
// 		method: 'GET',
// 		url: '/',
// 		handler: (req, res) => {
// 			res.sendFile('index.html');
// 		},
// 	});
// 	next();
// });

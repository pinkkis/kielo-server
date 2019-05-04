import * as fp from 'fastify-plugin';
import { injectable, singleton } from 'tsyringe';

const PREFIX = '/';

@injectable()
@singleton()
export class PublicController {
	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(PREFIX, (req, res) => {
					res.sendFile('index.html');
				});

				next();
			}),
		];
	}
}

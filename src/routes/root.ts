import * as fp from 'fastify-plugin';
import { API_ROOT } from 'src/config';
import { injectable, singleton } from 'tsyringe';

const PREFIX = API_ROOT;

@injectable()
@singleton()
export class RootController {
	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(PREFIX + '', async (req, res) => {
					return { hello: 'world' };
				});
			}),
		];
	}
}

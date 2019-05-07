import * as fp from 'fastify-plugin';
import { ConfigService } from 'src/config';
import { injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class RootController {
	private readonly PREFIX: string;

	constructor(private config: ConfigService) {
		this.PREFIX = this.config.get('API_ROOT');
	}
	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(this.PREFIX + '', async (req, res) => {
					return { hello: 'world' };
				});
			}),
		];
	}
}

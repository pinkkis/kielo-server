import * as fp from 'fastify-plugin';
import { injectable, singleton } from 'tsyringe';
import { schema as bodySchema } from './schemas/admin-broadcast-body.schema';
import { ConfigService } from 'src/config';
import { SocketService } from 'src/services/SocketService';

@injectable()
@singleton()
export class AdminController {
	private readonly PREFIX: string;

	constructor(private config: ConfigService, private socketService: SocketService) {
		this.PREFIX = this.config.get('API_ROOT') + '/admin';
	}

	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				const schema = { body: bodySchema };

				server.post(
					this.PREFIX + '/broadcast',
					{ schema },
					async (req, res) => {
						return this.socketService.broadcast(req.body.message, req.body.rooms);
					},
				);
			}),
		];
	}
}

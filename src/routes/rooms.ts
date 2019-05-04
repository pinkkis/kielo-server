import * as fp from 'fastify-plugin';
import { injectable, singleton } from 'tsyringe';
import { RoomService } from 'src/services/RoomService';
import { ConfigService } from 'src/config';

@injectable()
@singleton()
export class RoomsController {
	private readonly PREFIX: string;

	constructor(private config: ConfigService, private service: RoomService) {
		this.PREFIX = this.config.get('API_ROOT') + '/rooms';
	}

	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(this.PREFIX + '', async (req, res) => {
					const rooms = await this.service.getRooms();
					return rooms;
				});
			}),
			fp(async (server, opts, next) => {
				const schema = {
					params: {
						type: 'object',
						properties: {
							roomId: {
								type: 'string',
							},
						},
						required: ['roomId'],
					},
				};

				server.get(this.PREFIX + '/:roomId', {schema}, async (req, res) => {
					const room = await this.service.getRoom(req.params.roomId);
					return room;
				});
			}),
		];
	}
}

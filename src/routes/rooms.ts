import * as fp from 'fastify-plugin';
import { API_ROOT } from 'src/config';
import { injectable, singleton } from 'tsyringe';
import { RoomService } from 'src/services/RoomService';

const PREFIX = API_ROOT + '/rooms';

@injectable()
@singleton()
export class RoomsController {
	constructor(private service: RoomService) {}

	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(PREFIX + '', async (req, res) => {
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

				server.get(PREFIX + '/:roomId', {schema}, async (req, res) => {
					const room = await this.service.getRoom(req.params.roomId);
					return room;
				});
			}),
		];
	}
}

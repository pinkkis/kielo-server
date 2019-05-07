import * as fp from 'fastify-plugin';
import { injectable, singleton } from 'tsyringe';
import { RoomService } from 'src/services/RoomService';
import { ConfigService } from 'src/config';
import { schema as getRoomSchema } from './schemas/get-room.schema';
import { schema as createRoomSchema } from './schemas/create-room.schema';

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
				server.get(this.PREFIX + '/', async (req, res) => {
					const rooms = await this.service.getRooms();
					return rooms;
				});
			}),
			fp(async (server, opts, next) => {
				const schema = {
					params: getRoomSchema,
				};

				server.get(this.PREFIX + '/:roomId', {schema}, async (req, res) => {
					const room = await this.service.getRoom(req.params.roomId);
					return room;
				});
			}),
			fp(async (server, opts, next) => {
				const schema = {
					body: createRoomSchema,
				};

				server.post(this.PREFIX + '/', {schema}, async (req, res) => {
					const room = await this.service.addRoom(req.body);
					return room;
				});
			}),
			fp(async (server, opts, next) => {
				server.delete(this.PREFIX + '/:roomId', async (req, res) => {
					const room = await this.service.getRoom(req.params.roomId);
					return room;
				});
			}),
		];
	}
}

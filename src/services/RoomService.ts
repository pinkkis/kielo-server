import { injectable, singleton } from 'tsyringe';
import { Room, RoomProperties, RoomStatus } from 'src/models/Room';
import { DatabaseService } from './DatabaseService';
import * as generateId from 'nanoid/generate';
import { ConfigService } from 'src/config';
import { EventEmitter } from 'events';
import { RoomType } from 'src/enums/RoomType';
import { Client } from 'src/models/Client';
import { logger } from 'src/Logger';

@injectable()
@singleton()
export class RoomService extends EventEmitter {
	private readonly rooms: Map<string, Room>;
	private readonly roomCodeLength: number;
	private readonly roomCodeAlphabet: string;

	private adminRoom: Room;
	private lobbyRoom: Room;

	constructor(private db: DatabaseService, private config: ConfigService) {
		super();

		this.rooms = new Map<string, Room>();

		this.roomCodeAlphabet = this.config.get('roomcodealphabet');
		this.roomCodeLength = this.config.get('roomcodelength');

		// create some default rooms
		this.addRoom({ name: '🌟 Admin', maxSize: 50, type: RoomType.ADMIN, canClose: false })
			.then( (r: Room) => this.adminRoom = r);
		this.addRoom({ name: '👥 Lobby', type: RoomType.CHAT, canClose: false })
			.then( (r: Room) => this.lobbyRoom = r);
	}

	public getRooms(): Promise<RoomStatus[]> {
		const results = Array.from(this.rooms.values()).map( (r: Room) => r.getStatus() );
		return Promise.resolve(results);
	}

	public getRoom(id: string): Promise<Room> {
		return Promise.resolve(this.rooms.get(id));
	}

	public addRoom(roomArgs: RoomProperties = {}): Promise<Room> {
		const room = new Room(this, roomArgs);
		this.rooms.set(room.id, room);
		logger.info(`RoomService:addRoom - ${room.id}, ${RoomType[room.type]}, ${room.name}`);
		return Promise.resolve(room);
	}

	public closeRoom(roomId: string): Promise<boolean> {
		const room = this.rooms.get(roomId);
		if (room && room.canClose) {
			room.destroy();
			this.rooms.delete(room.id);
			logger.info(`RoomService:closeRoom - ${room.id}`);
			return Promise.resolve(true);
		}

		logger.warning(`RoomService:closeRoom - ${room.id}`);
		return Promise.resolve(false);
	}

	public generateUniqueRoomCode(): string {
		let code: string;

		while (!code || this.rooms.has(code)) {
			code = generateId(this.roomCodeAlphabet, this.roomCodeLength).toUpperCase();
		}

		return code;
	}

	public addClientToAdminRoom(client: Client): boolean {
		if (this.adminRoom) {
			return this.adminRoom.addClient(client);
		}

		return false;
	}

	public addClientToLobbyRoom(client: Client): boolean {
		if (this.lobbyRoom) {
			return this.lobbyRoom.addClient(client);
		}

		return false;
	}

	// - Private --------------
}

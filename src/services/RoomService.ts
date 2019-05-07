import { injectable, singleton } from 'tsyringe';
import { Room, RoomProperties } from 'src/models/Room';
import { DatabaseService } from './DatabaseService';
import { logger } from 'src/Logger';
import * as generateId from 'nanoid/generate';
import { ConfigService } from 'src/config';
import { EventEmitter } from 'events';

@injectable()
@singleton()
export class RoomService extends EventEmitter {
	private readonly rooms: Map<string, Room>;
	private readonly roomCodeLength: number;
	private readonly roomCodeAlphabet: string;

	constructor(private db: DatabaseService, private config: ConfigService) {
		super();

		this.rooms = new Map<string, Room>();

		this.roomCodeAlphabet = this.config.get('roomcodealphabet');
		this.roomCodeLength = this.config.get('roomcodelength');
	}

	public getRooms(): Promise<Room[]> {
		return Promise.resolve(Array.from(this.rooms.values()));
	}

	public getRoom(id: string): Promise<Room> {
		return Promise.resolve(this.rooms.get(id));
	}

	public addRoom(roomArgs: RoomProperties = {}): Promise<Room> {
		const room = new Room(this, roomArgs);
		this.rooms.set(room.id, room);

		return Promise.resolve(room);
	}

	public closeRoom(roomId: string): Promise<boolean> {
		const room = this.rooms.get(roomId);
		if (room) {
			room.destroy();
			this.rooms.delete(room.id);

			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	}

	public generateUniqueRoomCode(): string {
		let code;

		while (!code || this.rooms.has(code)) {
			code = generateId(this.roomCodeAlphabet, this.roomCodeLength);
		}

		return code;
	}

	// - Private --------------
}

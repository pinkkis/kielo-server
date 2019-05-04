import { injectable, singleton } from 'tsyringe';
import { Room } from 'src/models/Room';
import { DatabaseService } from './DatabaseService';
import { logger } from 'src/Logger';

@injectable()
@singleton()
export class RoomService {
	private readonly rooms: Map<string, Room>;

	constructor(private db: DatabaseService) {
		this.rooms = new Map<string, Room>();
		const foo = this.db.getFoo();
		logger.info(foo);
	}

	public getRooms(): Promise<Room[]> {
		return Promise.resolve(Array.from(this.rooms.values()));
	}

	public getRoom(id: string): Promise<Room> {
		return Promise.resolve(null);
	}

	public addRoom(room: Room): Promise<Room> {
		return Promise.resolve(null);
	}
}

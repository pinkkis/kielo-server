import { injectable } from 'tsyringe';
import { Room } from 'src/models/Room';
import { DatabaseService } from './DatabaseService';

@injectable()
export class RoomService {
	private readonly rooms: Map<string, Room>;

	constructor(private db: DatabaseService) {
		console.log(this.db.getFoo());
	}
}

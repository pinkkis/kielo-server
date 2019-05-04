import { injectable } from 'tsyringe';
import { Room } from 'src/models/Room';
import { DatabaseService } from './DatabaseService';
import { logger } from 'src/Logger';

@injectable()
export class RoomService {
	private readonly rooms: Map<string, Room>;

	constructor(private db: DatabaseService) {
		const foo = this.db.getFoo();
		logger.info(foo);
	}
}

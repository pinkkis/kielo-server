import { singleton, injectable } from 'tsyringe';
import { EventEmitter } from 'events';
import { ConfigService } from 'src/config';
import { logger } from 'src/Logger';
import { SocketService } from './SocketService';
import { RoomService } from 'dist/services/RoomService';

@singleton()
@injectable()
export class StemService extends EventEmitter {

	constructor(private config: ConfigService, private socket: SocketService, private rooms: RoomService) {
		super();

		logger.info('🌟🌟 Started Nerve Service');
	}

}

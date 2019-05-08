import { singleton, injectable } from 'tsyringe';
import { ConfigService } from 'src/config';
import { EventEmitter } from 'events';
import { logger } from 'src/Logger';

@injectable()
@singleton()
export class DatabaseService extends EventEmitter {
	constructor(private config: ConfigService) {
		super();
		logger.info('⚡ Starting Database Service');
	}

	public connect(): void {
		//
	}
}

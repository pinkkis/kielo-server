import { singleton, injectable } from 'tsyringe';
import { ConfigService } from 'src/config';
import { EventEmitter } from 'events';

@injectable()
@singleton()
export class DatabaseService extends EventEmitter {
	constructor(private config: ConfigService) {
		super();
	}

	public connect(): void {
		//
	}
}

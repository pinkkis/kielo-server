import { singleton, injectable } from 'tsyringe';
import { ConfigService } from 'src/config';
import { EventEmitter } from 'events';

@singleton()
@injectable()
export class NerveService extends EventEmitter {

	constructor(private config: ConfigService) {
		super();
	}

}

import { EventEmitter } from 'events';
import { singleton, injectable } from 'tsyringe';
import { ConfigService } from 'src/config';
import { FastifyService } from 'src/services/FastifyService';
import { StemService } from 'src/services/StemService';
import { logger } from 'src/Logger';

@singleton()
@injectable()
export class KieloApp extends EventEmitter {
	constructor(
		private config: ConfigService,
		private fastify: FastifyService,
		private stem: StemService,
	) {
		super();

		process.on('uncaughtException', err => {
			logger.error(err);
		});

		process.on('unhandledRejection', err => {
			logger.error(err);
		});
	}

	public async start() {
		try {
			await this.fastify.start();
		} catch (err) {
			logger.error(err);
			this.destroy();
		}
	}

	public destroy() {
		this.stem.destroy();
		this.fastify.destroy();

		logger.warn(`KieloApp - exiting...`);
		process.exit(1);
	}
}

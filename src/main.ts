import 'reflect-metadata';
import 'dotenv';
import { container } from 'tsyringe';
import { FastifyService } from './services/FastifyService';
import { logger } from './Logger';
import { StemService } from './services/StemService';

process.on('uncaughtException', err => {
	logger.error(err);
});

process.on('unhandledRejection', err => {
	logger.error(err);
});

async function bootstrap() {
	const stem = container.resolve(StemService);
	const httpService = container.resolve(FastifyService);

	try {
		await httpService.start();

	} catch (err) {
		logger.error(err);
		process.exit(1);
	}
}

bootstrap();

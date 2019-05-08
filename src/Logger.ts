import * as pino from 'pino';
import { container } from 'tsyringe';
import { ConfigService } from 'dist/config';

const config = container.resolve(ConfigService);

export const logger = pino({
	prettyPrint: true,
	enabled: config.get('appLogger'),
});

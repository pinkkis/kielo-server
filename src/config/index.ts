import { singleton } from 'tsyringe';
import { resolve } from 'path';
import * as fs from 'fs';
import { ServerOptionsAsSecureHttp2 } from 'fastify';

export const API_ROOT = '/api';

@singleton()
export class ConfigService {
	get API_ROOT(): string {
		return API_ROOT;
	}

	get WEB_PORT(): number {
		return Number(process.env.SERVER_PORT) || 3000;
	}

	get fastifyOptions(): ServerOptionsAsSecureHttp2 {
		return {
			http2: true,
			https: {
				allowHTTP1: true,
				key: fs.readFileSync(
					resolve(__dirname, '..', '..', 'certificates', 'key.pem'),
				),
				cert: fs.readFileSync(
					resolve(__dirname, '..', '..', 'certificates', 'cert.pem'),
				),
			},
			logger: {
				prettyPrint: true,
			},
			ignoreTrailingSlash: true,
		};
	}
}

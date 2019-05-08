import { singleton } from 'tsyringe';
import { resolve } from 'path';
import * as fs from 'fs';
import { ServerOptionsAsSecureHttp2 } from 'fastify';

export const API_ROOT = '/api';

@singleton()
export class ConfigService {
	private readonly settings: Map<string, any> = new Map<string, any>();

	constructor() {
		this.settings.set('roomcodealphabet', '123456789abcdefghjkmnprstuvwxyz');
		this.settings.set('roomcodelength', 5);
		this.settings.set('heartbeatInterval', 10000);
		this.settings.set('API_ROOT', '/api');
		this.settings.set('WEB_PORT', Number(process.env.SERVER_PORT) || 3000);
		this.settings.set('fastifyOptions', {
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
			// logger: {
			// 	prettyPrint: { colorize: true },
			// },
			ignoreTrailingSlash: true,
		} as ServerOptionsAsSecureHttp2);
	}

	public get(key: string): any {
		return this.settings.get(key);
	}
}

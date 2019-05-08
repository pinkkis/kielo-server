import { singleton } from 'tsyringe';
import { resolve } from 'path';
import * as fs from 'fs';
import { ServerOptionsAsSecureHttp2, ListenOptions } from 'fastify';

@singleton()
export class ConfigService {
	private readonly settings: Map<string, any> = new Map<string, any>();
	private readonly readOnlySettings: Set<string> = new Set<string>();

	constructor() {
		this.settings.set('roomcodealphabet', '123456789abcdefghjkmnprstuvwxyz');
		this.settings.set('roomcodelength', Number(process.env.ROOM_CODE_LENGTH) || 5);
		this.settings.set('heartbeatInterval', Number(process.env.HEARTBEAT_INTERVAL) || 10000);
		this.settings.set('API_ROOT', '/api');
		this.settings.set('WEB_PORT', Number(process.env.SERVER_PORT) || 3000);
		this.settings.set('appLogger', process.env.APP_LOGGER !== undefined ? process.env.APP_LOGGER === 'true' : true);
		this.settings.set('fastifyListenOptions', {
			port: this.settings.get('WEB_PORT'),
			host: process.env.HOST_LISTEN || '0.0.0.0',
		} as ListenOptions);
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
			ignoreTrailingSlash: true,
			// enable fastify logging
			...process.env.HTTP_LOGGER === 'true' && {logger: { prettyPrint: { colorize: true } } },
		} as ServerOptionsAsSecureHttp2);

		this.setReadOnly();
	}

	public get(key: string): any {
		return this.settings.get(key);
	}

	public set(key: string, value: any): ConfigService {
		if (!this.readOnlySettings.has(key)) {
			this.settings.set(key, value);
		}
		return this;
	}

	private setReadOnly(): void {
		this.settings.forEach( (v, k) => {
			this.readOnlySettings.add(k);
		});
	}
}

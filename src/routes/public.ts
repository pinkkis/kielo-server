import * as fp from 'fastify-plugin';
import { injectable, singleton } from 'tsyringe';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from 'src/Logger';
import { ConfigService } from 'src/config';

@injectable()
@singleton()
export class PublicController {
	private socketClientFiles: Map<string, any> = new Map<string, any>();
	private readonly PREFIX: string;
	private fileTester: RegExp;

	constructor(private config: ConfigService) {
		this.PREFIX = '/';
		this.fileTester = new RegExp(/^(\w|\d|-|_)*\.js$/i);
	}

	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(this.PREFIX, (req, res) => {
					res.sendFile('index.html');
				});

				next();
			}),
			fp(async (server, opts, next) => {
				server.get(this.PREFIX + 'client/:js', (req, res) => {
					if (!this.socketClientFiles.has(req.params.js)) {
						this.socketClientFiles.set(req.params.js, this.loadSocketClientFile(req.params.js));
					}

					res.type('text/javascript').send(this.socketClientFiles.get(req.params.js));
				});

				next();
			}),
		];
	}

	private loadSocketClientFile(filename: string) {
		if (!this.fileTester.test(filename)) {
			logger.warn(`Trying to find a non-js file "${filename}"`);
			return null;
		}

		const file = readFileSync(resolve(__dirname, '..', '..', 'dist', 'SocketClient', filename));
		logger.info('loaded socket file', filename);
		return file;
	}
}

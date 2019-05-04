import * as fp from 'fastify-plugin';
import { injectable, singleton } from 'tsyringe';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from 'src/Logger';

const PREFIX = '/';

@injectable()
@singleton()
export class PublicController {
	private socketClient: any;

	get routes(): any[] {
		return [
			fp(async (server, opts, next) => {
				server.get(PREFIX, (req, res) => {
					res.sendFile('index.html');
				});

				next();
			}),
			fp(async (server, opts, next) => {
				server.get(PREFIX + 'client/client.js', (req, res) => {
					if (!this.socketClient) {
						this.socketClient = this.loadSocketClientFile();
					}

					res.type('text/javascript').send(this.socketClient);
				});

				next();
			}),
		];
	}

	private loadSocketClientFile() {
		const file = readFileSync(resolve(__dirname, '..', '..', 'dist', 'SocketClient', 'client.js'));
		logger.info('loaded socket file', file);
		return file;
	}
}

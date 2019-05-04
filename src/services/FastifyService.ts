import { injectable, singleton } from 'tsyringe';
import { ConfigService } from 'src/config';
import fastify = require('fastify');
import { IncomingMessage, ServerResponse, Server } from 'http';
import * as fastifyBlipp from 'fastify-blipp';
import * as fastifyStatic from 'fastify-static';
import * as fastifyWs from 'fastify-ws';
import { routes } from '../routes';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { IKieloHttpServer } from 'src/models/IKieloHttpServer';
import { SocketService } from './SocketService';
import { DatabaseService } from './DatabaseService';
import { logger } from 'src/Logger';

@injectable()
@singleton()
export class FastifyService extends EventEmitter {
	public server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> & IKieloHttpServer;

	constructor(private config: ConfigService, private socketService: SocketService, private dbService: DatabaseService) {
		super();

		this.server = fastify(this.config.fastifyOptions);
		this.server.register(fastifyWs);
		this.server.register(fastifyStatic, {
			root: resolve(__dirname, '..', '..', 'public'),
			wildcard: true,
		});
		this.server.register(fastifyBlipp);

		this.setupAppEvents();
		this.loadRoutes();
	}

	public async start(): Promise<any> {
		await this.server.listen(this.config.WEB_PORT);
		this.server.blipp();
		return Promise.resolve(true);
	}

	private setupAppEvents(): void {
		this.server.ready( (err: Error) => {
			if (err) {
				this.emit('startupError', err);
				throw err;
			}

			this.emit('ready');
			logger.info('FastifyServer#ready');
			this.readyHandler();
		});


	}

	private readyHandler() {
		this.server.ws
			.on('connection', socket => this.socketService.connectionHandler(socket));
	}

	private loadRoutes(): void {
		routes.forEach( r => {
			this.server.register(r);
		});

		this.emit('routesloaded');
	}
}

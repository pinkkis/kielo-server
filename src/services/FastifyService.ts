import { injectable, singleton } from 'tsyringe';
import { ConfigService } from 'src/config';
import * as fastify from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';
import * as fastifyBlipp from 'fastify-blipp';
import * as fastifyStatic from 'fastify-static';
import * as fastifyWs from 'fastify-ws';
import { routes } from '../routes';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { SocketService } from './SocketService';
import { DatabaseService } from './DatabaseService';
import { logger } from 'src/Logger';
import * as WebSocket from 'ws';
import { KieloEvent } from 'src/enums/KieloEvent';

export interface IKieloHttpServer {
	blipp?: any;
	ws?: any;
}

@injectable()
@singleton()
export class FastifyService extends EventEmitter {
	public server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> & IKieloHttpServer;

	constructor(private config: ConfigService, private socketService: SocketService, private dbService: DatabaseService) {
		super();

		this.server = fastify(this.config.get('fastifyOptions'));
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
		return this.server
				.listen(this.config.get('fastifyListenOptions') as fastify.ListenOptions)
				.then( () => {
					this.server.blipp();
				});
	}

	public destroy(): void {
		this.server.close();
	}

	private setupAppEvents(): void {
		this.server.ready( (err: Error) => {
			if (err) {
				this.emit(KieloEvent.APP_STARTUP_ERROR, err);
				throw err;
			}

			this.emit(KieloEvent.APP_READY);
			logger.info('FastifyServer#ready');
			this.readyHandler();
		});
	}

	private readyHandler() {
		this.socketService.setServer(this.server.ws);
		this.server.ws
			.on(KieloEvent.WS_CONNECTION, (socket: WebSocket) => this.socketService.connectionHandler(socket));
	}

	private loadRoutes(): void {
		routes.forEach( r => {
			this.server.register(r);
		});

		this.emit(KieloEvent.APP_ROUTES_LOADED);
	}
}

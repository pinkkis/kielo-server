import { singleton, injectable } from 'tsyringe';
import { EventEmitter } from 'events';
import { ConfigService } from 'src/config';
import { logger } from 'src/Logger';
import { SocketService } from './SocketService';
import { RoomService } from 'dist/services/RoomService';
import { FastifyService } from './FastifyService';
import { KieloEvent } from 'src/enums/KieloEvent';
import { KieloMessage } from 'src/models/KieloMessage';
import { MessageHandlerService } from './MessageHandlerService';
import { Client } from 'src/models/Client';

@singleton()
@injectable()
export class StemService extends EventEmitter {
	constructor(
		private config: ConfigService,
		private socket: SocketService,
		private rooms: RoomService,
		private fastify: FastifyService,
		private messageHandlers: MessageHandlerService,
	) {
		super();
		logger.info('🌿 Starting Stem Service');
		this.setupFastifyServiceEvents();
		this.setupSocketServiceEvents();
		this.setupRoomServiceEvents();
	}

	public destroy() {
		// remove all event handlers and shutdown gracefully
	}

	// Setup methods

	private setupRoomServiceEvents() {
		//
	}

	private setupSocketServiceEvents() {
		this.socket.on(KieloEvent.CLIENT_MESSAGE, (message: KieloMessage, client: Client) => {
			this.messageHandlers.handleClientMessage(message, client);
		});
	}

	private setupFastifyServiceEvents() {
		//
	}

	// Message Handler
}

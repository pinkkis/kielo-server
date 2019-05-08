import { injectable, singleton } from 'tsyringe';
import { EventEmitter } from 'events';
import { KieloMessage } from 'src/models/KieloMessage';
import { logger } from 'src/Logger';
import { MessageType } from 'src/enums/MessageType';
import { Client } from 'src/models/Client';
import { RoomService } from './RoomService';

@injectable()
@singleton()
export class MessageHandlerService extends EventEmitter {
	constructor(private rooms: RoomService) {
		super();
	}

	public handleClientMessage(message: KieloMessage, client: Client) {
		switch (message.messageType) {
			case MessageType.ADMIN_JOIN:
				this.onAdminJoin(message, client);
				break;

			case MessageType.ROOM_REQUEST_CREATE:
				this.onRoomRequestCreate(message, client);
				break;

			case MessageType.ROOM_REQUEST_JOIN:
				this.onRoomRequestJoin(message, client);
				break;

			case MessageType.ROOM_REQUEST_LEAVE:
				this.onRoomRequestLeave(message, client);
				break;

			default:
				logger.warn(`Unknown messageType "${MessageType[message.messageType]}"`);
		}
	}

	public onAdminJoin(message: KieloMessage, client: Client) {
		logger.info(`MessageHandlerService: ${client.id} request ${MessageType[message.messageType]}`);
		this.rooms.addClientToAdminRoom(client);
	}

	public onRoomRequestCreate(message: KieloMessage, client: Client) {
		logger.info(`MessageHandlerService: ${client.id} request ${MessageType[message.messageType]}`);
	}

	public onRoomRequestJoin(message: KieloMessage, client: Client) {
		logger.info(`MessageHandlerService: ${client.id} request ${MessageType[message.messageType]}`);
	}

	public onRoomRequestLeave(message: KieloMessage, client: Client) {
		logger.info(`MessageHandlerService: ${client.id} request ${MessageType[message.messageType]}`);
	}
}

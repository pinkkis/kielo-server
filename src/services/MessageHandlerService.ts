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
				this.onAdminJoin(client);
				break;

			default:
				logger.warn(`Unknown messageType "${message.messageType}"`);
		}
	}

	public onAdminJoin(client: Client) {
		this.rooms.addClientToAdminRoom(client);
	}
}

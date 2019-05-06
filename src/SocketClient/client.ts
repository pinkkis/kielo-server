import { EventEmitter } from './events';
import { MessageModel } from '../models/MessageModel';
import { MessageType } from '../models/MessageType';

export { MessageType };
export class SocketClient extends EventEmitter {
	public socket: WebSocket;

	constructor(host: string = location.origin.replace(/^http/, 'ws')) {
		super();

		this.socket = new WebSocket(host);
		this.setupEvents();
	}

	public setupEvents(): void {
		this.socket.addEventListener('message', msg => {
			const message = MessageModel.fromMessageEvent(msg);
			this.emit('message', message);
		});

		this.socket.addEventListener('open', () => {
			this.emit('open', this);
		});
	}

	public send(message: string|MessageModel, messageType?: MessageType) {
		if (typeof message === 'string') {
			message = MessageModel.fromString(message, messageType || MessageType.MESSAGE);
		}

		if (this.socket.OPEN) {
			this.socket.send(message.serialized);
		}
	}

	public close(code: number = 1001, reason?: string) {
		if (this.socket.OPEN || this.socket.CONNECTING) {
			this.socket.close(code, reason);
		}
	}
}

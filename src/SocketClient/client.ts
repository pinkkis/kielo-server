import { EventEmitter } from './events';
import { KieloMessage } from '../models/KieloMessage';
import { MessageType } from '../models/MessageType';

export { MessageType };

// TODO: reconnect logic
export class SocketClient extends EventEmitter {
	public socket: WebSocket;

	constructor(host: string = location.origin.replace(/^http/, 'ws')) {
		super();

		this.socket = new WebSocket(host);
		this.setupEvents();
	}

	public setupEvents(): void {
		this.socket.addEventListener('message', msg => {
			const message = KieloMessage.fromMessageEvent(msg);
			this.emit('message', message);
		});

		this.socket.addEventListener('open', () => {
			this.socket.binaryType = 'arraybuffer';
			this.emit('open', this);
		});
	}

	public send(message: string|object|KieloMessage, messageType?: MessageType) {
		let msg: KieloMessage;

		if (typeof message === 'string') {
			msg = KieloMessage.fromString(message, messageType || MessageType.MESSAGE);
		} else if (typeof message === 'object') {
			msg = KieloMessage.fromObject(message);
		} else {
			msg = message;
		}

		if (this.socket.OPEN) {
			this.socket.send(msg.serialized);
		}
	}

	public close(code: number = 1001, reason?: string) {
		if (this.socket.OPEN || this.socket.CONNECTING) {
			this.socket.close(code, reason);
		}
	}
}

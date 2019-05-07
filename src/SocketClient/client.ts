import { EventEmitter } from './events';
import { KieloMessage } from '../models/KieloMessage';
import { MessageType } from '../enums/MessageType';
import { KieloEvent } from '../enums/KieloEvent';

export { MessageType, KieloEvent };

// TODO: reconnect logic
export class SocketClient extends EventEmitter {
	public socket: WebSocket;
	private reconnect: boolean = true;
	private reconnectTime: number = 1000;

	constructor(host: string = location.origin.replace(/^http/, 'ws')) {
		super();

		this.socket = new WebSocket(host);
		this.setupEvents();
	}

	public setupEvents(): void {
		this.socket.addEventListener(KieloEvent.WS_MESSAGE, msg => {
			const message = KieloMessage.fromMessageEvent(msg);
			this.emit(KieloEvent.CLIENT_MESSAGE, message);
		});

		this.socket.addEventListener(KieloEvent.WS_OPEN, () => {
			this.socket.binaryType = 'arraybuffer';
			this.reconnectTime = 1000;
			this.emit(KieloEvent.CLIENT_OPEN, this);
		});

		this.socket.addEventListener(KieloEvent.WS_CLOSE, (evt: MessageEvent) => {
			this.emit(KieloEvent.CLIENT_DISCONNECT, this);
		});

		this.socket.addEventListener(KieloEvent.WS_ERROR, (evt: MessageEvent) => {
			this.emit(KieloEvent.CLIENT_ERROR, evt);
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

import { EventEmitter } from './events.js'; // TS doesn't care that it's .js and not .ts, but .js is required for browser module resolution

export class SocketClient extends EventEmitter {
	public socket: WebSocket;

	constructor(host: string = location.origin.replace(/^http/, 'ws')) {
		super();

		this.socket = new WebSocket(host);
		this.setupEvents();
	}

	public setupEvents(): void {
		this.socket.addEventListener('message', msg => {
			console.log(msg.data);
			this.emit('message', msg);
		});

		this.socket.addEventListener('open', () => {
			this.socket.send('hello foo');
			this.emit('open', this);
		});
	}

	public send(data: string | ArrayBuffer | Blob) {
		if (this.socket.OPEN) {
			this.socket.send(data);
		}
	}

	public close(code: number = 1001, reason?: string) {
		if (this.socket.OPEN || this.socket.CONNECTING) {
			this.socket.close(code, reason);
		}
	}
}

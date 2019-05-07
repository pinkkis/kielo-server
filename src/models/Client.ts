import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { KieloEvent } from 'src/enums/KieloEvent';

export class Client extends EventEmitter {
	public readonly id: string;
	public socket: WebSocket;
	public isAlive: boolean;

	constructor(id: string, socket: WebSocket) {
		super();

		this.id = id;
		this.socket = socket;
		this.isAlive = true;
		this.emit(KieloEvent.CLIENT_CREATE, this);
	}

	public heartBeat(hasHeartBeat: boolean = false) {
		this.isAlive = hasHeartBeat;
	}

	public destroy() {
		this.socket.terminate();
		this.isAlive = false;
		this.emit(KieloEvent.CLIENT_DESTROY, this.id);
	}
}

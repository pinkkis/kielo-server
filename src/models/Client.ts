import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { KieloEvent } from 'src/enums/KieloEvent';
import { logger } from 'src/Logger';

export interface ClientStatus {
	id: string;
	isAlive: boolean;
	rooms: string[];
	ip: string;
}

export class Client extends EventEmitter {
	public readonly id: string;
	public socket: WebSocket;
	public isAlive: boolean;
	public rooms: Set<string> = new Set<string>();

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
		this.rooms.clear();
		this.isAlive = false;
		this.emit(KieloEvent.CLIENT_DESTROY, this.id);
	}

	public getStatus(): ClientStatus {
		return {
			id: this.id,
			ip: (this.socket as any)._socket.remoteAddress,
			isAlive: this.isAlive,
			rooms: Array.from(this.rooms),
		};
	}
}

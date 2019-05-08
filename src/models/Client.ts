import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { KieloEvent } from 'src/enums/KieloEvent';
import { Room } from './Room';

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
	private rooms: Set<Room> = new Set<Room>();

	constructor(id: string, socket: WebSocket) {
		super();

		this.id = id;
		this.socket = socket;
		this.isAlive = true;
		this.emit(KieloEvent.CLIENT_CREATE, this);
	}

	public joinRoom(room: Room): void {
		this.rooms.add(room);
		this.emit(KieloEvent.CLIENT_JOIN_ROOM, room);
	}

	public leaveRoom(room: Room): void {
		this.rooms.delete(room);
		this.emit(KieloEvent.CLIENT_LEAVE_ROOM, room);
	}

	public heartBeat(hasHeartBeat: boolean = false) {
		this.isAlive = hasHeartBeat;
	}

	public destroy() {
		this.emit(KieloEvent.CLIENT_DESTROY, this.id);
		this.socket.terminate();
		this.rooms.clear();
		this.isAlive = false;
	}

	public getStatus(): ClientStatus {
		return {
			id: this.id,
			ip: (this.socket as any)._socket.remoteAddress,
			isAlive: this.isAlive,
			rooms: Array.from(this.rooms).map( (r: Room) => r.id ),
		};
	}
}

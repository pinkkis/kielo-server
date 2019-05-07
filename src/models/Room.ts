import { Client } from './Client';
import { EventEmitter } from 'events';
import { KieloMessage } from './KieloMessage';
import { MessageType } from '../enums/MessageType';
import { RoomService } from 'src/services/RoomService';
import { KieloEvent } from 'src/enums/KieloEvent';

export interface RoomProperties {
	name?: string;
	maxSize?: number;
	joinPeriod?: number;
}

export interface RoomStatus {
	id: string;
	maxSize: number;
	isOpen: boolean;
	clients: Client[];
	reservations: Set<string>;
}

export class Room extends EventEmitter {
	public readonly id: string;
	public readonly name: string;
	public readonly clients: Map<string, Client> = new Map<string, Client>();

	public isOpen: boolean;

	private maxSize: number = Infinity;
	private joinPeriod: number = 10000;

	private reservedSlots: Set<string> = new Set<string>();

	constructor(private readonly manager: RoomService, roomArgs: RoomProperties = {}) {
		super();

		this.id = this.manager.generateUniqueRoomCode();

		for (const key in roomArgs) {
			if (roomArgs.hasOwnProperty(key)) {
				this[key] = roomArgs[key];
			}
		}

		this.isOpen = true;
		this.emit(KieloEvent.ROOM_CREATE, this.id);
	}

	public destroy(force: boolean = false): Promise<boolean> {
		this.isOpen = false;
		this.broadcast(KieloMessage.fromObject({ messageType: MessageType.ROOM_CLOSING, r: this.id }));
		this.clients.clear();
		this.reservedSlots.clear();
		this.emit(KieloEvent.ROOM_CLOSE, this.id);
		return Promise.resolve(true);
	}

	public broadcast(message: KieloMessage, except: Client[] = []): void {
		this.clients.forEach( (c: Client) => {
			if (c.socket.readyState === WebSocket.OPEN && !except.includes(c)) {
				c.socket.send(message.serialized);
			}
		});
	}

	public send(message: KieloMessage, client: Client) {
		if (this.clients.has(client.id) && this.clients.get(client.id).socket.readyState === WebSocket.OPEN) {
			this.clients.get(client.id).socket.send(message.serialized);
		}
	}

	public get hasOpenSlots(): boolean {
		return this.isOpen && this.clients.size + this.reservedSlots.size < this.maxSize;
	}

	public reserveSlot(id: string): boolean {
		if (this.isOpen && this.hasOpenSlots) {
			this.reservedSlots.add(id);
			setTimeout(() => this.clearReservation(id), this.joinPeriod);
			return true;
		}

		return false;
	}

	public addClient(client: Client): boolean {
		if (this.hasOpenSlots) {
			this.clients.set(client.id, client);
			this.clearReservation(client.id);
			this.emit(KieloEvent.ROOM_JOIN, {room: this.id, client: client.id});
			return true;
		}

		return false;
	}

	public removeClient(client: Client): boolean {
		if (this.clients.has(client.id)) {
			this.clients.delete(client.id);
			this.emit(KieloEvent.ROOM_JOIN, {room: this.id, client: client.id});
			return true;
		}

		return false;
	}

	public getStatus(): Promise<RoomStatus> {
		return Promise.resolve({
			id: this.id,
			maxSize: this.maxSize,
			isOpen: this.isOpen,
			clients: Array.from(this.clients.values()),
			reservations: this.reservedSlots,
		});
	}

	// - Private -------------------------------

	private clearReservation(id: string): void {
		this.reservedSlots.delete(id);
	}
}

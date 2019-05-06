import { Client } from './Client';
import { EventEmitter } from 'events';
import { KieloMessage } from './KieloMessage';
import { MessageType } from './MessageType';
import { IOriginalMessage } from './IOriginalMessage';

export interface RoomProperties {
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

	constructor(roomArgs: RoomProperties = {}) {
		super();

		for (const key in roomArgs) {
			if (roomArgs.hasOwnProperty(key)) {
				this[key] = roomArgs[key];
			}
		}

		this.isOpen = true;
		this.emit('OPEN', this.id);
	}

	public destroy(force: boolean = false): Promise<boolean> {
		this.isOpen = false;
		this.broadcast(KieloMessage.fromObject({ messageType: MessageType.ROOM_CLOSING, r: this.id }));
		this.clients.clear();
		this.reservedSlots.clear();
		this.emit('CLOSE', this.id);
		return Promise.resolve(true);
	}

	public broadcast(message: KieloMessage): void {
		this.clients.forEach( (c: Client) => {
			c.socket.send(message.serialized);
		});
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
			return true;
		}

		return false;
	}

	public removeClient(client: Client): boolean {
		if (this.clients.has(client.id)) {
			this.clients.delete(client.id);
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

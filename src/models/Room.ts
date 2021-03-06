import { Client } from './Client';
import { EventEmitter } from 'events';
import { KieloMessage } from './KieloMessage';
import { MessageType } from '../enums/MessageType';
import { RoomService } from 'src/services/RoomService';
import { KieloEvent } from 'src/enums/KieloEvent';
import { RoomType } from 'src/enums/RoomType';
import { logger } from 'src/Logger';
import { KieloMessageFactory } from './KieloMessageFactory';

export interface RoomProperties {
	name?: string;
	maxSize?: number;
	type?: RoomType;
	joinPeriod?: number;
	canClose?: boolean;
}

export interface RoomStatus {
	id: string;
	maxSize: number;
	name?: string;
	type: RoomType;
	isOpen: boolean;
	canClose: boolean;
	clients: Client[];
	reservations: Set<string>;
}

export class Room extends EventEmitter {
	public readonly id: string;
	public readonly type: RoomType;
	public readonly name: string;
	public readonly clients: Map<string, Client> = new Map<string, Client>();

	public isOpen: boolean = false;
	public canClose: boolean = false;

	private maxSize: number = Infinity;
	private joinPeriod: number = 10000;

	private reservedSlots: Set<string> = new Set<string>();

	constructor(private readonly manager: RoomService, roomArgs: RoomProperties = {}) {
		super();

		for (const key in roomArgs) {
			if (roomArgs.hasOwnProperty(key)) {
				this[key] = roomArgs[key];
			}
		}

		this.id = this.manager.generateUniqueRoomCode();
		this.type = this.type || RoomType.CHAT;
		this.isOpen = true;
		this.emit(KieloEvent.ROOM_CREATE, this.id);
		logger.info(`Room:ctor - ${this.id}`);
	}

	public destroy(force: boolean = false): Promise<boolean> {
		this.isOpen = false;
		this.broadcast(KieloMessageFactory.fromObject({ messageType: MessageType.ROOM_CLOSING, r: this.id }));
		this.clients.clear();
		this.reservedSlots.clear();
		this.emit(KieloEvent.ROOM_CLOSE, this.id);
		logger.info(`Room:destroy - ${this.id}`);
		return Promise.resolve(true);
	}

	public broadcast(message: KieloMessage, except: Client[] = [], roomCode: boolean = true): void {
		if (roomCode) { message.roomId = this.id; }
		this.clients.forEach( (c: Client) => {
			if (c.socket.readyState === WebSocket.OPEN && !except.includes(c)) {
				c.socket.send(message.serialized);
			}
		});

		logger.info(`Room:broadcast - ${this.id} -> ${message.data}`);
	}

	public send(message: KieloMessage, client: Client, roomCode: boolean = true) {
		if (this.clients.has(client.id) && this.clients.get(client.id).socket.readyState === WebSocket.OPEN) {
			if (roomCode) { message.roomId = this.id; }
			this.clients.get(client.id).socket.send(message.serialized);
		}

		logger.info(`Room:send - ${this.id} -> ${message.data}`);
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
			client.joinRoom(this);
			this.emit(KieloEvent.ROOM_JOIN, {room: this.id, client: client.id});
			logger.info(`Room:addClient - ${this.id} -> ${client.id}`);
			return true;
		}

		return false;
	}

	public removeClient(client: Client): boolean {
		if (this.clients.has(client.id)) {
			client.leaveRoom(this);
			this.clients.delete(client.id);
			this.emit(KieloEvent.ROOM_JOIN, {room: this.id, client: client.id});
			logger.info(`Room:removeClient - ${this.id} -> ${client.id}`);
			return true;
		}

		return false;
	}

	public getStatus(): RoomStatus {
		return {
			id: this.id,
			maxSize: this.maxSize,
			name: this.name,
			type: this.type,
			isOpen: this.isOpen,
			canClose: this.canClose,
			clients: Array.from(this.clients.values()),
			reservations: this.reservedSlots,
		};
	}

	// - Private -------------------------------

	private clearReservation(id: string): void {
		this.reservedSlots.delete(id);
		logger.info(`Room:clearReservation - ${this.id}`);
	}
}

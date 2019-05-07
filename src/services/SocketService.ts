import { EventEmitter } from 'events';
import { injectable, singleton } from 'tsyringe';
import { Client, ClientStatus } from 'src/models/Client';
import * as generateId from 'nanoid';
import * as WebSocket from 'ws';
import { logger } from 'src/Logger';
import { ConfigService } from 'src/config';
import { KieloMessage } from 'src/models/KieloMessage';
import { MessageType } from 'src/enums/MessageType';
import { NerveService } from './NerveService';
import { KieloEvent } from 'src/enums/KieloEvent';

@injectable()
@singleton()
export class SocketService extends EventEmitter {
	private socketServer: any;
	private clients: Map<string, Client>;
	private heartbeatInterval: NodeJS.Timeout;

	constructor(private readonly config: ConfigService, private nerve: NerveService) {
		super();
		this.clients = new Map<string, Client>();
		this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), this.config.get('heartbeatInterval') );
	}

	public connectionHandler(socket: WebSocket): void {
		const clientId = generateId();
		const newClient = new Client(clientId, socket);

		newClient.socket.on('message', (message: any) => this.onMessageHandler(newClient, message) );
		newClient.socket.on('close' , (code: number, reason: string) => this.onCloseHandler(newClient, code, reason) );
		newClient.socket.on('error', (error: Error) => this.onErrorHandler(newClient, error) );
		newClient.socket.on('pong', (data: Buffer) => this.onPongHandler(newClient, data) );

		this.clients.set(clientId, newClient);
		this.emit('connection:new', newClient);
		logger.info('SocketService#connection:new', newClient.id);
	}

	public onMessageHandler(client: Client, data: string|ArrayBuffer): void {
		const message = typeof data === 'string' ? KieloMessage.fromString(data)  : KieloMessage.fromArrayBuffer(data);
		this.emit(KieloEvent.CLIENT_MESSAGE, message);
		logger.info('socket#message', client.id, message.messageType, message.data);
	}

	public onCloseHandler(client: Client, code: number, reason: string): void {
		logger.info('socket#close', client.id, code, reason);
		if (this.clients.has(client.id)) {
			this.clients.delete(client.id);
			this.emit(KieloEvent.CLIENT_DISCONNECT, client.id);
			client.destroy();
		}
	}

	public onErrorHandler(client: Client, error: Error): void {
		logger.error('socket#error', client.id, error);
		this.emit(KieloEvent.CLIENT_ERROR, {client: client.id, error: error.message});
	}

	public onPongHandler(client: Client, data: Buffer): void {
		logger.trace('socket#pong', client.id);
		client.heartBeat(true);
	}

	public getConnections(): Map<string, Client> {
		return this.clients;
	}

	public getClients(): Promise<ClientStatus[]> {
		const clients = Array.from(this.clients.values()).map( (c: Client) => c.getStatus());
		return Promise.resolve(clients);
	}

	public disconnectClient(clientId: string): Promise<boolean> {
		if (this.clients.has(clientId)) {
			this.clients.get(clientId).destroy();
			return Promise.resolve(true);
		}

		return Promise.resolve(false);
	}

	public setServer(wss: any): void {
		this.socketServer = wss;
		this.emit(KieloEvent.SOCKET_AVAILABLE);
		logger.info('SocketService#available');
	}

	// TODO: rooms
	public broadcast(message: string, rooms: string[] = [], except: Client[] = []): any {
		let targetsMessaged = 0;
		const mm = KieloMessage.fromString(message, MessageType.BROADCAST);

		this.clients.forEach( (client: Client) => {
			if (client.socket.readyState === WebSocket.OPEN && !except.includes(client)) {
				client.socket.send(mm.serialized);
				targetsMessaged++;
			}
		});

		return `Broadcast to ${targetsMessaged} clients`;
	}

	// ------------

	private checkHeartbeat(): void {
		if (this.clients.size) {
			logger.info('SocketServer:checkHeartbeat', this.clients.size);
			this.emit(KieloEvent.HEARTBEAT);
		}

		this.clients.forEach( (client: Client) => {
			if (!client.isAlive) {
				logger.info('heartbeat fail', client.id);
				client.socket.terminate();
				this.clients.delete(client.id);
				return;
			}

			if (client.socket.readyState === WebSocket.OPEN) {
				client.heartBeat();
				client.socket.ping();
			}
		});
	}

	private stopHeartbeat(): void {
		clearInterval(this.heartbeatInterval);
	}

	private getClientBySocket(ws: WebSocket): Client {
		for (const client of this.clients.values()) {
			if (client.socket === ws) {
				return client;
			}
		}

		return null;
	}
}

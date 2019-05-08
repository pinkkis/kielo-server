import { EventEmitter } from 'events';
import { injectable, singleton } from 'tsyringe';
import { Client, ClientStatus } from 'src/models/Client';
import * as generateId from 'nanoid';
import * as WebSocket from 'ws';
import { logger } from 'src/Logger';
import { ConfigService } from 'src/config';
import { KieloMessage } from 'src/models/KieloMessage';
import { MessageType } from 'src/enums/MessageType';
import { KieloEvent } from 'src/enums/KieloEvent';
import { KieloMessageFactory } from 'src/models/KieloMessageFactory';

@injectable()
@singleton()
export class SocketService extends EventEmitter {
	private socketServer: any;
	private clients: Map<string, Client>;
	private heartbeatInterval: NodeJS.Timeout;

	constructor(private readonly config: ConfigService) {
		super();
		logger.info('🔌 Starting Socket Service');
		this.clients = new Map<string, Client>();
		this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), this.config.get('heartbeatInterval') );
	}

	public connectionHandler(socket: WebSocket): void {
		const clientId = generateId();
		const newClient = new Client(clientId, socket);

		newClient.socket.on(KieloEvent.WS_MESSAGE, (message: any) => this.onMessageHandler(newClient, message) );
		newClient.socket.on(KieloEvent.WS_CLOSE , (code: number, reason: string) => this.onCloseHandler(newClient, code, reason) );
		newClient.socket.on(KieloEvent.WS_ERROR, (error: Error) => this.onErrorHandler(newClient, error) );
		newClient.socket.on(KieloEvent.WS_PONG, (data: Buffer) => this.onPongHandler(newClient, data) );

		this.clients.set(clientId, newClient);
		this.emit(KieloEvent.SOCKET_CONNECT, newClient);
		logger.info('SocketService#SOCKET_CONNECT', newClient.id);
	}

	public onMessageHandler(client: Client, data: string | ArrayBuffer): void {
		const message = typeof data === 'string'
						? KieloMessageFactory.fromString(data)
						: KieloMessageFactory.fromArrayBuffer(data);

		this.emit(KieloEvent.CLIENT_MESSAGE, message, client);
		logger.info('socket#WS_MESSAGE', client.id, message.messageType, message.data); // TODO: change to 'trace'
	}

	public onCloseHandler(client: Client, code: number, reason: string): void {
		logger.info('socket#WS_CLOSE', client.id, code, reason);
		if (this.clients.has(client.id)) {
			this.clients.delete(client.id);
			this.emit(KieloEvent.CLIENT_DISCONNECT, client.id);
			client.destroy();
		}
	}

	public onErrorHandler(client: Client, error: Error): void {
		logger.error('socket#WS_ERROR', client.id, error);
		this.emit(KieloEvent.CLIENT_ERROR, {client: client.id, error: error.message});
	}

	public onPongHandler(client: Client, data: Buffer): void {
		logger.trace('socket#WS_PONG', client.id);
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
			logger.info(`SocketService:Disconnecting client room ${clientId}`);
			this.clients.get(clientId).destroy();
			return Promise.resolve(true);
		}

		return Promise.resolve(false);
	}

	public setServer(wss: any): void {
		this.socketServer = wss;
		this.emit(KieloEvent.SOCKET_AVAILABLE);
		logger.info('SocketService#SOCKET_AVAILABLE');
	}

	// TODO: rooms
	public broadcast(message: string, rooms: string[] = [], except: Client[] = []): any {
		let targetsMessaged = 0;
		const mm = KieloMessageFactory.fromString(message, MessageType.BROADCAST);

		this.clients.forEach( (client: Client) => {
			if (client.socket.readyState === WebSocket.OPEN && !except.includes(client)) {
				client.socket.send(mm.serialized);
				targetsMessaged++;
			}
		});

		logger.info(`ScoketService:broadcast "${message}"`);
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
				logger.info('SocketServer:heartbeatFail', client.id);
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

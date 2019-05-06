import { EventEmitter } from 'events';
import { injectable, singleton } from 'tsyringe';
import { Client } from 'src/models/Client';
import * as generateId from 'nanoid';
import * as WebSocket from 'ws';
import { logger } from 'src/Logger';
import { ConfigService } from 'src/config';
import { KieloMessage } from 'src/models/KieloMessage';
import { MessageType } from 'src/models/MessageType';
import { NerveService } from './NerveService';

@injectable()
@singleton()
export class SocketService extends EventEmitter {
	private socketServer: any;
	private connections: Map<string, Client>;
	private heartbeatInterval: NodeJS.Timeout;

	constructor(private readonly config: ConfigService, private nerve: NerveService) {
		super();
		this.connections = new Map<string, Client>();
		this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), this.config.get('heartbeatInterval') );
	}

	public connectionHandler(socket: WebSocket): void {
		const clientId = generateId();
		const newClient = new Client(clientId, socket);

		newClient.socket.on('message', (message: any) => this.onMessageHandler(newClient, message) );
		newClient.socket.on('close' , (code: number, reason: string) => this.onCloseHandler(newClient, code, reason) );
		newClient.socket.on('error', (error: Error) => this.onErrorHandler(newClient, error) );
		newClient.socket.on('pong', (data: Buffer) => this.onPongHandler(newClient, data) );

		this.connections.set(clientId, newClient);
		this.emit('connection:new', newClient);
		logger.info('SocketService#connection:new', newClient.id);
	}

	public onMessageHandler(client: Client, data: string|ArrayBuffer): void {
		const message = typeof data === 'string' ? KieloMessage.fromString(data)  : KieloMessage.fromArrayBuffer(data);

		logger.info('socket#message', client.id, message.messageType, message.data);
	}

	public onCloseHandler(client: Client, code: number, reason: string): void {
		logger.info('socket#close', client.id, code, reason);
		if (this.connections.has(client.id)) {
			this.connections.delete(client.id);
			this.emit('connection:delete', client.id);
			client.destroy();
		}
	}

	public onErrorHandler(client: Client, error: Error): void {
		logger.error('socket#error', client.id, error);
	}

	public onPongHandler(client: Client, data: Buffer): void {
		logger.trace('socket#pong', client.id);
		client.heartBeat(true);
	}

	public getConnections(): Map<string, Client> {
		return this.connections;
	}

	public getClients(): Client[] {
		return Array.from(this.connections.values());
	}

	public setServer(wss: any): void {
		this.socketServer = wss;
		this.emit('server:available');
		logger.info('SocketService#available');
	}

	public broadcast(message: string, rooms?: string[]): any {
		const targets = this.connections;
		let targetsMessaged = 0;
		const mm = KieloMessage.fromString(message, MessageType.BROADCAST);

		targets.forEach( (client: Client) => {
			if (client.socket.readyState === WebSocket.OPEN) {
				client.socket.send(mm.serialized);
				targetsMessaged++;
			}
		});

		return `Transmitted to ${targetsMessaged} clients`;
	}

	// ------------

	private checkHeartbeat(): void {
		if (this.connections.size) {
			logger.info('SocketServer:checkHeartbeat', this.connections.size);
		}

		this.connections.forEach( (client: Client) => {
			if (!client.isAlive) {
				logger.info('heartbeat fail', client.id);
				return client.socket.terminate();
			}

			if (client.socket.OPEN) {
				client.heartBeat();
				client.socket.ping();
			}
		});
	}

	private stopHeartbeat(): void {
		clearInterval(this.heartbeatInterval);
	}

	// private getClientBySocket(ws: WebSocket): Client {
	// 	for (const client of this.connections.values()) {
	// 		if (client.socket === ws) {
	// 			return client;
	// 		}
	// 	}

	// 	return null;
	// }
}

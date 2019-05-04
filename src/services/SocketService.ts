import { EventEmitter } from 'events';
import { injectable, singleton } from 'tsyringe';
import { Client } from 'src/models/Client';
import * as generateId from 'nanoid';
import { logger } from 'src/Logger';
import { stringify } from 'querystring';

@injectable()
@singleton()
export class SocketService extends EventEmitter {
	private connections: Map<string, Client>;

	constructor() {
		super();
		this.connections = new Map<string, Client>();
	}

	public connectionHandler(socket: WebSocket): void {
		const clientId = generateId();
		const newClient = new Client(clientId, socket);

		newClient.socket.onmessage = this.messageHandler;

		this.connections.set(clientId, newClient);
		this.emit('connection:new', newClient);
		logger.info('new client', newClient.id);
	}

	public messageHandler(event: MessageEvent): void {
		console.log(event.type, event.data, event.target);
	}

	public getConnections(): Map<string, Client> {
		return this.connections;
	}

	public getClients(): Client[] {
		return Array.from(this.connections.values());
	}

	// erver.ready( (err: Error) => {
	// 	if (err) {
	// 		throw err;
	// 	}

	// 	(server as any).ws
	// 		.on('connection', (socket) => {
	// 			console.log('Client connected');

	// 			socket.on('message', (msg: any) => {
	// 				console.log('Client message: ', msg);
	// 			});

	// 			socket.on('close', () => {
	// 				console.log('Client disconnected');
	// 			});
	// 		})
	// });
}

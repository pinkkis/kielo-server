export class Client {
	public readonly id: string;
	public socket: WebSocket;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.socket = socket;
	}
}

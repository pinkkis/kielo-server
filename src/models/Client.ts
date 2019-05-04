import * as WebSocket from 'ws';

export class Client {
	public readonly id: string;
	public socket: WebSocket;
	public isAlive: boolean;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.socket = socket;
		this.isAlive = true;
	}

	public heartBeat(hasHeartBeat: boolean = false) {
		this.isAlive = hasHeartBeat;
	}

	public destroy() {
		// nohting for now.
	}
}

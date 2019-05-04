export class SocketClient {
	public socket: WebSocket;

	constructor(host: string = location.origin.replace(/^http/, 'ws')) {
		this.socket = new WebSocket(host);

		this.socket.addEventListener('message', msg => {
			console.log(msg.data);
		});

		this.socket.addEventListener('open', () => {
			this.socket.send('hello foo');
		});
	}
}

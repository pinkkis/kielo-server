import { SocketClient, MessageType, KieloEvent } from '/client/client.bundle.js';

const ws = new SocketClient();

ws.on(KieloEvent.CLIENT_OPEN, () => {
	ws.send('hello 123');
}, this);

ws.on(KieloEvent.CLIENT_MESSAGE, (msg) => {
	console.log(msg);
}, this);

import { SocketClient, MessageType } from '/client/client.bundle.js';

const ws = new SocketClient();

const $debug = document.getElementById('debug');

const $string = document.querySelector('a.send-string');
const $type = document.querySelector('a.send-type');

$string.addEventListener('click', () => {
	ws.send('foo');
});

$type.addEventListener('click', () => {
	ws.send({ msg: '1', messageType: MessageType.ROOM_JOINED });
});

ws.on('open', () => {
	ws.send('hello 123');
});

ws.on('message', (msg) => {
	$debug.value += `${msg.messageType} - ${msg.data.msg}\n`;
}, this);

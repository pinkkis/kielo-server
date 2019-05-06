import { FOO_VALUE } from './common.js';
import { SocketClient } from '/client/client.bundle.js';

const ws = new SocketClient();

const $debug = document.getElementById('debug');

const $foo = document.querySelector('a.send-foo');
const $float = document.querySelector('a.send-float');

$foo.addEventListener('click', () => {
	ws.send('foo');
});

$float.addEventListener('click', () => {
	ws.send(Math.random().toString());
});

ws.on('open', () => {
	ws.send('hello 123');
});

ws.on('message', (msg) => {
	$debug.value += `\n${msg.messageType} - ${msg.message}`;
}, this);

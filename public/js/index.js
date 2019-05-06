import { FOO_VALUE } from './common.js';
import { SocketClient } from '/client/client.bundle.js';

const ws = new SocketClient();

const $debug = document.getElementById('debug');

ws.on('message', (msg) => {
	$debug.innerText += `\n${JSON.stringify(msg)}`;
});

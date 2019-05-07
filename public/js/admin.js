import { SocketClient, MessageType, KieloEvent } from '/client/client.bundle.js';

class App {
	constructor() {
		this.ws = new SocketClient();
		this.$roomList = document.getElementById('room-list');
		this.$clientList = document.getElementById('client-list');
		this.clients = [];
		this.rooms = [];

		this.$createRoomButton = document.getElementById('create-room');

		this.initEvents();
		this.getRooms();
		this.getClients();
	}

	initEvents() {
		this.ws.on(KieloEvent.CLIENT_OPEN, () => {
			this.ws.send('', MessageType.ADMIN_JOIN);
		}, this);

		this.ws.on(KieloEvent.CLIENT_MESSAGE, (msg) => this.messageHandler(msg), this);

		this.$createRoomButton.addEventListener('click', async () => {
			await this.createRoom({ name: 'Random Room ' + Math.floor(Math.random() * 1000) });
		});
	}

	messageHandler(message) {
		console.log(message);
	}

	async createRoom(data) {
		const createResult = await fetch('/api/rooms', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
		.then( response => response.json())
		.then( async () => await this.getRooms());
	}

	async getRooms() {
		this.rooms = await fetch('/api/rooms').then( (response) => response.json());
		this.renderRooms();
	}

	async getClients() {
		this.clients = await fetch('/api/admin/clients').then( (response) => response.json());
		this.renderClients();
	}

	async renderRooms() {
		this.clearChildren(this.$roomList);
		const template = document.querySelector('#room-item');

		this.rooms.forEach( room => {
			const row = document.importNode(template.content, true);
			row.querySelector('li').setAttribute('data-room-id', room.id);
			row.querySelector('li').classList.add('list-group-item', room.isOpen ? 'list-group-item-success' : 'list-group-item-warning');
			row.querySelector('.room').textContent = `${room.id} - ${room.name}`;
			row.querySelector('.clients .badge').textContent = room.clients.length;
			row.querySelector('.reserved .badge').textContent = Object.keys(room.reservations).length;
			row.querySelector('.room-clients').textContent = room.clients.map( c => c.id ).join(', ');

			if (!room.canClose) {
				const close = row.querySelector('.close-room');
				close.parentNode.removeChild(close);
			}

			this.$roomList.appendChild(row);
		});
	}

	async renderClients() {
		this.clearChildren(this.$clientList);
		const template = document.querySelector('#client-item');

		this.clients.forEach( client => {
			const row = document.importNode(template.content, true);
			row.querySelector('li').setAttribute('data-client-id', client.id);
			row.querySelector('li').classList.add('list-group-item', client.isAlive ? 'list-group-item-success' : 'list-group-item-warning');
			row.querySelector('.client').textContent = `${client.id} - ${client.ip}`;
			row.querySelector('.client-rooms').textContent = Object.keys(client.rooms).map( r => r.id ).join(', ');

			this.$clientList.appendChild(row);
		});
	}

	/**
	 * @param {HTMLElement} target - parent to be cleared
	 */
	clearChildren(target) {
		while (target.lastChild) {
			target.removeChild(target.lastChild);
		}
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	const app = new App();
});

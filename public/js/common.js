import { html, LitElement } from 'https://unpkg.com/lit-element@2.1.0/lit-element.js?module';

export class RoomList extends LitElement {
	constructor() {
		super();
		this.message = 'loading...';
	}

	_createRoot() {
		return true;
	}

	render() {
		return html`
		<div class="card">
			<div class="card-body">
				<h5 class="card-title">Rooms</h5>
				<!-- <h6 class="card-subtitle mb-2 text-muted">
						Card subtitle
					</h6> -->
				<p class="card-text">
					Current rooms
				</p>
				<a href="#" class="card-link" id="create-room">Create room</a>
			</div>
			<ul class="list-group list-group-flush">
				<li class="list-group-item">Cras justo odio</li>
			</ul>
		</div>
		`;
	}
}

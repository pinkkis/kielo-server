import { Listener } from './listener';


export class EventEmitter {
	private events: Map<string, Listener[]> = new Map<string, Listener[]>();

	public on(eventKey: string, listener: () => void, context?: any): EventEmitter {
		if (!this.isValidListener(listener)) { return; }

		if (!this.events.has(eventKey)) {
			this.events.set(eventKey, []);
		}

		this.events.get(eventKey).push(new Listener(listener, context || this));

		return this;
	}

	public once(eventKey: string, listener: () => void, context?: any): EventEmitter {
		this.on(eventKey, function cb() {
			this.off(eventKey, cb);
			listener.apply(context || this, arguments);
		});

		return this;
	}

	public off(eventKey?: string, listener?: () => void): EventEmitter {
		if (!eventKey) {
			this.events.clear();
		} else if (!listener) {
			this.events.set(eventKey, []);
		} else {
			const events = this.events.get(eventKey);
			const index = events.findIndex( (l: Listener) => {
				return l.fn === listener;
			});
			if (index > -1) {
				events.splice(index, 1);
			}
		}

		return this;
	}

	public emit(eventKey: string, data: any): EventEmitter {
		const listeners = this.events.get(eventKey) || [];
		listeners.forEach( (l: Listener) => {
			l.fn.apply(l.ctx || this, [data]);
		});

		return this;
	}

	private isValidListener(target: any) {
		return typeof target === 'function' || typeof target === 'object';
	}
}

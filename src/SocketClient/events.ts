class Listener {
	constructor(public fn: () => void, public ctx: any) {}
}

// tslint:disable-next-line: max-classes-per-file
export class EventEmitter {
	private events: Map<string, Listener[]> = new Map<string, Listener[]>();

	public on(event: string, listener: () => void, context?: any): EventEmitter {
		if (!this.isValidListener(listener)) { return; }

		if (!this.events.has(event)) {
			this.events.set(event, []);
		}

		this.events.get(event).push(new Listener(listener, context || this));

		return this;
	}

	public once(event: string, listener: () => void, context?: any): EventEmitter {
		this.on(event, function cb() {
			this.off(event, cb);
			listener.apply(context || this, arguments);
		});

		return this;
	}

	public off(event?: string, listener?: () => void): EventEmitter {
		if (!event) {
			this.events.clear();
		} else if (!listener) {
			this.events.set(event, []);
		} else {
			const events = this.events.get(event);
			const index = events.findIndex( (l: Listener) => {
				return l.fn === listener;
			});
			if (index > -1) {
				events.splice(index, 1);
			}
		}

		return this;
	}

	public emit(event: string, data: any): EventEmitter {
		const listeners = this.events.get(event) || [];
		listeners.forEach( (l: Listener) => {
			l.fn.apply(l.ctx || this, data);
		});

		return this;
	}

	private isValidListener(target: any) {
		return typeof target === 'function' || typeof target === 'object';
	}
}

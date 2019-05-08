import { MessageType } from '../enums/MessageType';
import { KieloSerializer } from 'src/services/KieloSerializer';

export interface IOriginalMessage {
	/** message type enum value */
	messageType?: number;

	/** Serialized messagetype */
	t?: number;

	/** Room id */
	r?: string;

	/** Value for payloads that take single argument */
	v?: string|number;

	/** Text messages outside of game use */
	msg?: string;

	[propName: string]: any;
}

export class KieloMessage {
	public messageType: number;
	public roomId: string;
	private message: IOriginalMessage;

	constructor(
		input: any,
		messageType?: number,
		roomId?: string,
	) {
		if (Object.prototype.toString.call(input) !== '[object Object]') {
			this.deserialize(input);
		} else {
			this.messageType = messageType || MessageType.BASE;
			this.message = input;
			this.roomId = roomId || '';
		}
	}

	public get data(): any {
		return this.message;
	}

	public get serialized(): any {
		return KieloSerializer.serialize({
			...this.message,
			t: this.messageType,
			...this.roomId && { r: this.roomId }, // conditionally add room code to payload
		});
	}

	private deserialize(input: any): any {
		this.message = KieloSerializer.deserialize(input);

		this.messageType = this.message.t || MessageType.BASE;
		this.roomId = this.message.r || '';

		if (this.message.t) { delete this.message.t; }
		if (this.message.r) { delete this.message.r; }

		return this;
	}
}

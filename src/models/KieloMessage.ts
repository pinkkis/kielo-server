import { MessageType } from '../enums/MessageType';
import { encode, decode, Any } from 'messagepack';
import { IOriginalMessage } from './IOriginalMessage';

export class KieloMessage {
	public messageType: MessageType|number;
	public roomId: string;
	private message: IOriginalMessage;

	public static fromMessageEvent(event: MessageEvent) {
		return new KieloMessage(event.data, null);
	}

	public static fromArrayBuffer(ab: ArrayBuffer) {
		return new KieloMessage(ab, null);
	}

	public static fromObject(input: IOriginalMessage) {
		const messageType: MessageType = input.messageType || MessageType.MESSAGE;
		delete input.messageType;

		const roomId: string = input.roomId || '';
		delete input.roomId;

		return new KieloMessage(input, messageType, roomId);
	}

	public static fromString(
		input: string,
		messageType: MessageType|number = MessageType.MESSAGE,
		roomId?: string,
	) {
		return new KieloMessage({ msg: input }, messageType, roomId);
	}

	constructor(
		input: any,
		messageType?: MessageType|number,
		roomId?: string,
	) {
		if (input instanceof ArrayBuffer || input instanceof Buffer) {
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
		return encode({
			...this.message,
			t: this.messageType,
			...this.roomId && { r: this.roomId }, // conditionally add room code to payload
		});
	}

	private deserialize(input: any): any {
		this.message = decode(input, Any);

		this.messageType = this.message.t
			? MessageType[this.message.t as keyof MessageType]
			: MessageType.BASE;

		this.roomId = this.message.r || '';

		if (this.message.t) { delete this.message.t; }
		if (this.message.r) { delete this.message.r; }

		return this;
	}
}

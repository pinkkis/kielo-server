import { MessageType } from './MessageType';
import { encode, decode, Any } from 'messagepack';
import { IOriginalMessage } from './IOriginalMessage';

export class KieloMessage {
	public messageType: MessageType|number;
	private serializedMessage: ArrayBuffer;
	private originalMessage: any;

	public static fromMessageEvent(event: MessageEvent) {
		return new KieloMessage(true, event.data, null);
	}

	public static fromArrayBuffer(input: ArrayBuffer) {
		return new KieloMessage(true, input, null);
	}

	public static fromObject(input: IOriginalMessage) {
		const messageType: MessageType = input.messageType || MessageType.MESSAGE;
		delete input.messageType;
		return new KieloMessage(false, input, messageType);
	}

	public static fromString(
		input: string,
		messageType: MessageType = MessageType.MESSAGE,
	) {
		return new KieloMessage(
			false,
			{ msg: input },
			messageType,
		);
	}

	constructor(
		serialized: boolean = false,
		input: any,
		messageType?: MessageType|number,
	) {
		if (!serialized) {
			this.messageType = messageType || MessageType.BASE;
			this.serialize(input);
		} else {
			this.serializedMessage = input;
			this.deserialize(input);
		}
	}

	public get data(): any {
		return this.originalMessage;
	}

	public get serialized(): any {
		return this.serializedMessage;
	}

	private serialize(input: any): any {
		this.originalMessage = input;
		this.serializedMessage = encode({...input, t: this.messageType});
		return this;
	}

	private deserialize(input: any): any {
		this.serializedMessage = input;
		this.originalMessage = decode(input, Any);
		this.messageType = this.originalMessage.t
			? MessageType[this.originalMessage.t as keyof MessageType]
			: MessageType.BASE;

		if (this.originalMessage.t) {
			delete this.originalMessage.t;
		}

		return this;
	}
}

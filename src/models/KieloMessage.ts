import { MessageType } from './MessageType';
import { encode, decode, Any } from 'messagepack';

export class KieloMessage {
	public messageType: MessageType;
	private serializedMessage: ArrayBuffer;
	private originalMessage: any = null;

	public static fromMessageEvent(event: MessageEvent) {
		return new KieloMessage(true, event.data, null);
	}

	public static fromArrayBuffer(input: ArrayBuffer) {
		return new KieloMessage(true, input, null);
	}

	public static fromObject(input: any) {
		const messageType = input.t || MessageType.MESSAGE;
		delete input.t;
		return new KieloMessage(false, input, messageType);
	}

	public static fromString(
		input: string,
		messageType: MessageType = MessageType.MESSAGE,
	) {
		return new KieloMessage(
			false,
			{ t: messageType, message: input },
			messageType,
		);
	}

	constructor(
		serialized: boolean = false,
		input: any,
		messageType?: MessageType,
	) {
		if (!serialized) {
			this.messageType = messageType || MessageType.BASE;
			this.serialize(input);
		} else {
			this.serializedMessage = input;
			this.deserialize(input);
		}
	}

	public get message(): any {
		return this.originalMessage;
	}

	public get serialized(): any {
		return this.serializedMessage;
	}

	private serialize(input: any): any {
		this.originalMessage = input;
		this.serializedMessage = encode(input);
		return this;
	}

	private deserialize(input: any): any {
		this.serializedMessage = input;
		this.originalMessage = decode(input, Any);
		this.messageType = this.originalMessage.t
			? MessageType[this.originalMessage.t as keyof MessageType]
			: MessageType.BASE;

		return this;
	}
}

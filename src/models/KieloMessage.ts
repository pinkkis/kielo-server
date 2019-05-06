import { MessageType } from './MessageType';
import { encode, decode } from 'messagepack';

export class KieloMessage {
	public type: 'string' | 'binary';
	public messageType: MessageType;
	private serializedMessage: Uint8Array = null;
	private originalMessage: any = null;

	public static fromMessageEvent(event: MessageEvent) {
		return new KieloMessage(true, event.data, null);
	}

	public static fromSerialized(input: any) {
		return new KieloMessage(true, input, null);
	}

	public static fromString(
		input: string,
		messageType: MessageType = MessageType.MESSAGE,
	) {
		return new KieloMessage(false, input, messageType);
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

	public get isBinary(): boolean {
		return this.type === 'binary';
	}

	public get message(): any {
		return this.originalMessage;
	}

	public get serialized(): any {
		return this.serializedMessage;
	}

	private serialize(input: any): any {
		this.type = typeof input === 'string' ? 'string' : 'binary';
		this.originalMessage = input;
		this.serializedMessage = encode(input);
		return this;
	}

	private deserialize(input: any): any {
		this.serializedMessage = input;
		this.originalMessage = decode(input);
		this.messageType = this.originalMessage.messageType
			? MessageType[this.originalMessage.messageType as keyof MessageType]
			: MessageType.BASE;

		return this;
	}
}

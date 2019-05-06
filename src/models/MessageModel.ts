import { MessageType } from './MessageType';

export const SEPARATOR = '|:';

export class MessageModel {
	public type: 'string'|'binary';
	public messageType: MessageType;
	private serializedMessage: any = null;
	private originalMessage: any = null;

	public static fromMessageEvent(event: MessageEvent) {
		return new MessageModel(true, event.data, null);
	}

	public static fromSerialized(input: any) {
		return new MessageModel(true, input, null);
	}

	public static fromString(input: string, messageType: MessageType = MessageType.MESSAGE) {
		return new MessageModel(false, input, messageType);
	}

	constructor(serialized: boolean = false, input: any, messageType?: MessageType) {
		if (!serialized) {
			this.messageType = messageType || MessageType.BASE;
			this.originalMessage = input;
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

		this.serializedMessage = `${this.messageType}|:${input}`;
		return this;
	}

	private deserialize(input: any): any {
		const splitInput = input.split(SEPARATOR);
		this.messageType = MessageType[splitInput[0] as keyof MessageType];
		this.originalMessage = splitInput[1];

		return this;
	}

}

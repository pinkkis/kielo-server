import { KieloMessage, IOriginalMessage } from './KieloMessage';
import { MessageType } from 'src/enums/MessageType';

export class KieloMessageFactory {
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
		messageType: MessageType = MessageType.MESSAGE,
		roomId?: string,
	) {
		return new KieloMessage({ msg: input }, messageType, roomId);
	}
}

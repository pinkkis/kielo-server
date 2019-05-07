import { MessageType } from 'dist/models/MessageType';

export interface IOriginalMessage {
	/** message type enum */
	messageType?: MessageType|number;

	/** Room id */
	r?: string;

	/** Value for payloads that take single argument */
	v?: string|number;

	/** Text messages outside of game use */
	msg?: string;

	[propName: string]: any;
}

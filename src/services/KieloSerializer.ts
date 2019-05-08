import { encode, decode, Any } from 'messagepack';
import { IOriginalMessage } from 'src/models/KieloMessage';

export class KieloSerializer {
	public static serialize(input: any): any {
		return encode(input);
	}

	public static deserialize(input: any): IOriginalMessage {
		return decode(input, Any);
	}
}

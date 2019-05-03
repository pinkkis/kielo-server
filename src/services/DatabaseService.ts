import { singleton } from 'tsyringe';

@singleton()
export class DatabaseService {
	public getFoo(): string {
		return 'foo';
	}
}

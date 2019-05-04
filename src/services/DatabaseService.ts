import { singleton, injectable } from 'tsyringe';

@injectable()
@singleton()
export class DatabaseService {
	public getFoo(): string {
		return 'foo';
	}
}

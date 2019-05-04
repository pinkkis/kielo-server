import { singleton } from 'tsyringe';

export const API_ROOT = '/api';

@singleton()
export class ConfigService {
	get API_ROOT(): string {
		return API_ROOT;
	}
}

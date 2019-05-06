import { singleton, injectable } from 'tsyringe';
import { ConfigService } from 'src/config';
import { Observable } from 'rxjs';

@singleton()
@injectable()
export class NerveService {
	public systemObservable: Observable<any>;
	public socketObservable: Observable<any>;

	constructor(private config: ConfigService) {}

}

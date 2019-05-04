import { EventEmitter } from 'events';
import { injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class SocketService extends EventEmitter {

}

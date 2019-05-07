export enum KieloEvent {
	ROOM_CREATE = 'room:create',
	ROOM_CLOSE = 'room:close',
	ROOM_RESERVE = 'room:reserve',
	ROOM_JOIN = 'room:join',
	ROOM_LEAVE = 'room:leave',
	ROOM_STATUS_CHANGE = 'room:statuschange',

	CLIENT_CONNECT = 'client:connect',
	CLIENT_DISCONNECT = 'client:disconnect',
	CLIENT_ERROR = 'client:error',
	CLIENT_MESSAGE = 'client:message',
	CLIENT_OPEN = 'client:open',
	CLIENT_DESTROY = 'client:destroy',
	CLIENT_CREATE = 'client:create',

	WS_CONNECTION = 'connection',
	WS_OPEN = 'open',
	WS_ERROR = 'error',
	WS_CLOSE = 'close',
	WS_PONG = 'pong',
	WS_MESSAGE = 'message',

	SOCKET_AVAILABLE = 'socket:available',

	APP_READY = 'app:ready',
	APP_STARTUP_ERROR = 'app:startuperror',
	APP_ROUTES_LOADED = 'app:routesloaded',

	HEARTBEAT = 'heartbeat',
}

import { io as ClientSocket } from 'socket.io-client';
import { SaveableData } from './Plugin';

declare global {
	namespace App {
		namespace Messages {
			interface FromClient {
				DISCOVER_PLUGINS: null;
				EXIT: null;
				SAVE: { id: string, meta: SaveableData, data: SaveableData },
				GET_SAVES: null;
				LOAD_SAVE: { id: string };
				DELETE_SAVE: { id: string };
				SAVE_CONFIG: SaveableData;
				LOAD_CONFIG: null;
				SERVER_MESSAGE: any;
			}
			interface FromServer {
				DISCOVER_PLUGINS_RESULT: {
					plugins: PluginDefinition[];
				}
				RELOAD_PLUGIN: PluginDefinition;
				GET_SAVES_RESULT: { saves: Array<{ id: string, meta: any }> };
				LOAD_SAVE_RESULT: { id: string, data: { [key: string]: SaveableData } };
				LOAD_CONFIG_RESULT: { data: { [key: string]: SaveableData } };
				SERVER_MESSAGE: any;
			}
		}
	}
}

const socket = ClientSocket({
	path: '/ws',
	transports: ['websocket']
});

function isValidMessage(data: any): data is { type: keyof App.Messages.FromServer, payload: App.Messages.FromServer[keyof App.Messages.FromServer] } {
	if (data == null || typeof data !== 'object') return false;
	return data.hasOwnProperty('type') &&  data.hasOwnProperty('payload');
}
socket.on('message', function(data: any) {
	if (isValidMessage(data)) {
		const { type, payload } = data;
		const listeners = messageListeners[type];
		if (listeners == null) return;
		for (let i = 0; i < listeners.length; i++) {
			listeners[i](payload);
		}
	}
});

const messageListeners: { [key: string]: Array<Function> } = {};
export function onMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void) {
	if (!messageListeners.hasOwnProperty(message)) messageListeners[message] = [];
	messageListeners[message].push(listener);
}
export function offMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void) {
	if (!messageListeners.hasOwnProperty(message)) return;
	const listeners = messageListeners[message];
	for (let i = 0; i < listeners.length; i++) {
		if (listeners[i] === listener) {
			listeners.splice(i, 1);
			return;
		}
	}
}

export function messageServer<Message extends keyof App.Messages.FromClient>(type: Message, payload: App.Messages.FromClient[Message]) {
	socket.send({ type, payload });
}

import React, { ReactNode, ReactElement } from 'react';
import { io as ClientSocket } from 'socket.io-client';

declare global {
	namespace App {
		namespace Messages {
			interface FromClient {
				DISCOVER_PLUGINS: null;
				EXIT: null;
			}
			interface FromServer {
				DISCOVER_PLUGINS_RESULT: {
					plugins: PluginDefinition[];
				}
				RELOAD_PLUGIN: PluginDefinition
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

interface SocketContextShape {
	socket: ReturnType<typeof ClientSocket>;
}

const SocketContext = React.createContext<SocketContextShape>({ socket: undefined as any as ReturnType<typeof ClientSocket> });

const socketContextValue = { socket };

export default function Socket({ children }: { children: ReactNode }): ReactElement {
	return (
		<SocketContext.Provider value={socketContextValue}>
			{children}
		</SocketContext.Provider>
	)
}

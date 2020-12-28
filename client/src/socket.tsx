import React, { ReactNode, ReactElement } from 'react';
import { io as ClientSocket } from 'socket.io-client';

const socket = ClientSocket({
	path: '/ws',
	transports: ['websocket']
});
socket.on('connect', function(){ console.log('connected'); socket.send({ test: 'ing' }) });
socket.on('message', function(data){ console.log(data) });
socket.on('disconnect', function(){ console.log('disconnected') });

interface SocketContextShape {
	socket: ReturnType<typeof ClientSocket>;
}

const SocketContext = React.createContext<SocketContextShape>({ socket: undefined });

const socketContextValue = { socket };

export default function Socket({ children }: { children: ReactNode }): ReactElement {
	return (
		<SocketContext.Provider value={socketContextValue}>
			{children}
		</SocketContext.Provider>
	)
}

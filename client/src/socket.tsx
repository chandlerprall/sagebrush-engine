import React, { ReactNode, ReactElement } from 'react';
import { io as ClientSocket } from 'socket.io-client';

const socket = ClientSocket({
	path: '/ws',
	transports: ['websocket']
});
// socket.on('connect', function(){});
// socket.on('message', function(data){});
// socket.on('disconnect', function(){});

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

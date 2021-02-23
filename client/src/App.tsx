import React, { useEffect } from 'react';
import Socket from './socket';
import { app, useResource, dispatchEvent } from './state';
import './plugins';

export default function App() {
	useEffect(() => {
		dispatchEvent('LOAD_PLUGINS', null);
	}, []);

	const Screen = useResource(app.currentScreen);
	return (
		<Socket>
			<Screen />
		</Socket>
	);
}

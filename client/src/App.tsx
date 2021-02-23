import React, { useEffect } from 'react';
import Socket from './socket';
import { app, useResource } from './state';
import './plugins';

export default function App() {
	useEffect(() => {
		app.dispatchEvent('LOAD_PLUGINS', null);
	}, []);

	const Screen = useResource(app.currentScreen);
	return (
		<Socket>
			<Screen />
		</Socket>
	);
}

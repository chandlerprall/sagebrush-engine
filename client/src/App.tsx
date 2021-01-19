import React, { useEffect } from 'react';
import Socket from './socket';
import { state, useResource, dispatchEvent } from './state';
import './plugins';

export default function App() {
	useEffect(() => {
		dispatchEvent('LOAD_PLUGINS', null);
	}, []);

	const Screen = useResource(state.app.currentScreen);
	return (
		<Socket>
			<Screen />
		</Socket>
	);
}

import React from 'react';
import Socket from './socket';
import { state, useResource } from './state';

export default function App() {
	const Screen = useResource(state.app.currentScreen);
	return (
		<Socket>
			<Screen />
		</Socket>
	);
}

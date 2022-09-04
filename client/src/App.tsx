import React, { useEffect } from 'react';
import { app, useResource } from './state';
import './plugins';

export default function App() {
	useEffect(() => {
		app.dispatchEvent('LOAD_PLUGINS', null);
	}, []);

	const Screen = useResource(app.currentScreen);
	const Global = useResource(app.globalNode);
	const isLoading = Screen === useResource(app.screens.loading);
	return (
		<>
			<Screen />
			{isLoading === false && Global}
		</>
	);
}

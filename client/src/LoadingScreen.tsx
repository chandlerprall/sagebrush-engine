import React  from 'react';
import { app, useResource } from './state';

export default function LoadingScreen() {
	const discoveredPlugins = useResource(app.plugins.discovered);
	const loadedPlugins = useResource(app.plugins.loaded);
	const loadingError = useResource(app.loadingError);

	return (
		<div>
			<p>Loading</p>
			<meter max={discoveredPlugins.length} value={loadedPlugins.length} />
			<p css={{ color: 'red' }}>{loadingError}</p>
		</div>
	)
}

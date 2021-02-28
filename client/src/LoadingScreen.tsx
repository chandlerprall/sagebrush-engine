import React  from 'react';
import { app, useResource } from './state';

export default function LoadingScreen() {
	const discoveredPlugins = useResource(app.plugins.discovered);
	const loadedPlugins = useResource(app.plugins.loaded);

	return (
		<div>
			<p css={{ color: 'red' }}>Loading</p>
			<meter max={discoveredPlugins.length} value={loadedPlugins.length} />
		</div>
	)
}

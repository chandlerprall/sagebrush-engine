import React, { useEffect } from 'react';
import { app, useResource, dispatchEvent } from './state';

export default function LoadingScreen() {
	const discoveredPlugins = useResource(app.plugins.discovered);
	const loadedPlugins = useResource(app.plugins.loaded);

	const discoveredPluginsCount = discoveredPlugins.length;
	const loadedPluginsCount = loadedPlugins.length;

	useEffect(() => {
		if (discoveredPluginsCount > 0 && discoveredPluginsCount === loadedPluginsCount) {
			dispatchEvent('FINISHED_LOADING_PLUGINS', null);
		}
	}, [discoveredPluginsCount, loadedPluginsCount])

	return (
		<div>
			<p css={{ color: 'red' }}>Loading</p>
			<meter max={discoveredPlugins.length} value={loadedPlugins.length} />
		</div>
	)
}

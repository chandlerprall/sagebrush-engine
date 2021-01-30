import React, { useEffect } from 'react';
import { state, useResource, dispatchEvent } from './state';

export default function LoadingScreen() {
	const discoveredPlugins = useResource(state.plugins.discovered);
	const loadedPlugins = useResource(state.plugins.loaded);

	const discoveredPluginsCount = discoveredPlugins.length;
	const loadedPluginsCount = loadedPlugins.length;

	useEffect(() => {
		if (discoveredPluginsCount > 0 && discoveredPluginsCount === loadedPluginsCount) {
			dispatchEvent('FINISHED_LOADING_PLUGINS', null);
		}
	}, [discoveredPluginsCount, loadedPluginsCount])

	return (
		<div>
			<p>I am a loading screen</p>
			<meter max={discoveredPlugins.length} value={loadedPlugins.length} />
		</div>
	)
}

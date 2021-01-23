import React from 'react';
import { state, useResource } from './state';

export default function LoadingScreen() {
	const discoveredPlugins = useResource(state.plugins.discovered);
	const loadedPlugins = useResource(state.plugins.loaded);

	return (
		<div>
			<p>I am a loading screen</p>
			<p>{discoveredPlugins.length} plugins found</p>
			<pre>
				{JSON.stringify(discoveredPlugins, null, 2)}
			</pre>
			<p>{loadedPlugins.length} plugins loaded</p>
		</div>
	)
}

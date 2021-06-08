import React from 'react';
import { PluginFunctions } from 'Plugin';

export default ({ useResource, plugin }: PluginFunctions<'core'>) => {
	return () => {
		const GameHeader = useResource(plugin.components.header);
		const GameRenderer = useResource(plugin.components.renderer);

		return (
			<div>
				<GameHeader />
				<GameRenderer />
			</div>
		)
	}
}

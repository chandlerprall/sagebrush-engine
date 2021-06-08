import React from 'react';
import { PluginFunctions } from 'Plugin';

export default ({ useResource, plugin }: PluginFunctions<'ui'>) => {
	return () => {
		const MenuTitle = useResource(plugin.menu.title);
		const MenuLayout = useResource(plugin.menu.layout);

		return (
			<>
				<MenuTitle/>
				<MenuLayout/>
			</>
		);
	}
}

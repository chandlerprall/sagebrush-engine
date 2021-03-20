import React from 'react';
import { PluginFunctions } from 'Plugin';

export default ({ getResource, plugin }: PluginFunctions<'ui'>) => {
	return () => {
		const MenuTitle = getResource(plugin.menu.title);
		const MenuLayout = getResource(plugin.menu.layout);

		return (
			<>
				<MenuTitle/>
				<MenuLayout/>
			</>
		);
	}
}

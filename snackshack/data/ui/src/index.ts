import { PluginFunctions } from 'Plugin';
import button from './button';
import menu from './menu';

window.registerPlugin('ui', (options: PluginFunctions<'ui'>) => {
	const ui: {
		[key: string]: (options: PluginFunctions<'ui'>) => any;
	} = { button, menu };
	const { setResource, plugin } = options;

	for (const key of Object.keys(ui)) {
		// @ts-ignore
		setResource(plugin[key], ui[key](options));
	}
});

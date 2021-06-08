import { PluginFunctions } from 'Plugin';
import { Button } from './button';
import { Input } from './form';
import HeadedSection from './headed_section';
import menu from './menu';
import styles from './styles';

window.registerPlugin('ui', (options: PluginFunctions<'ui'>) => {
	const ui: {
		[key: string]: (options: PluginFunctions<'ui'>) => any;
	} = {
		button: Button,
		input: Input,
		headedSection: HeadedSection,
		menu,
		styles
	};
	const { setResource, plugin } = options;

	for (const key of Object.keys(ui)) {
		// @ts-ignore
		setResource(plugin[key], ui[key](options));
	}

	setResource(options.app.screens.main, options.plugin.menu.screen);
});

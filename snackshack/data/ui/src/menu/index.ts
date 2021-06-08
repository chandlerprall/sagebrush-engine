import { PluginFunctions } from 'Plugin';
import buttons from './menu_buttons';
import layout from './menu_layout';
import title from './menu_title';
import mainscreen from './MainScreen';

export default function menu(options: PluginFunctions<'ui'>): App.Plugins['ui']['menu'] {
	return {
		screen: mainscreen(options),
		buttons: buttons(options),
		layout: layout(options),
		title: title(options),
		titleText: 'Menu Title',
	};
}

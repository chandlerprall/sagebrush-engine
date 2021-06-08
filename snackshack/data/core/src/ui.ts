import { PluginFunctions } from 'Plugin';

export default ({ getPlugin, setResource, plugin }: PluginFunctions<'core'>) => {
	const ui = getPlugin('ui');

	// palette
	setResource(ui.styles.primary, '#a8ddd3');
	setResource(ui.styles.border, '1px solid #71441d');
	setResource(ui.styles.focusOutline, '1px solid #e1b48d');

	// menu
	setResource(ui.menu.titleText, 'Snack Shack');
	setResource(ui.menu.buttons.start.onClick, () => plugin.dispatchEvent('newGame', null));
}

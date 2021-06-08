import { PluginFunctions } from 'Plugin';

const MenuButtons: (options: PluginFunctions<'ui'>) => App.Plugins['ui']['menu']['buttons'] = options => ({
	start: {
		children: 'New Game',
	},
	exit: {
		children: 'Exit',
		onClick: () => options.app.dispatchEvent('EXIT', null),
	},
});
export default MenuButtons;

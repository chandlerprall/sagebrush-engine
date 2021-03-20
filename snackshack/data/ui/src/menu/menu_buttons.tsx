import { PluginFunctions } from 'Plugin';

const MenuButtons: (options: PluginFunctions<'ui'>) => App.Plugins['ui']['menu']['buttons'] = () => [
	{
		children: 'Start Game',
		onClick: () => {
			alert('here');
		},
	}
];
export default MenuButtons;

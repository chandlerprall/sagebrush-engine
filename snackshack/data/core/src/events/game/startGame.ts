import { PluginFunctions } from 'Plugin';

export default ({ setResource, app, plugin }: PluginFunctions<'core'>) => {
	plugin.onEvent('startGame', ({ companyName }) => {
		setResource(plugin.game, {
			name: companyName,
			money: 100,
			isPaused: false,
		});
		setResource(app.currentScreen, plugin.screens.game);
	});
}

import { PluginFunctions } from 'Plugin';

export default ({ setResource, app, plugin }: PluginFunctions<'core'>) => {
	plugin.onEvent('newGame', () => {
		setResource(app.currentScreen, plugin.screens.newGame);
	});
}

import { PluginFunctions } from 'Plugin';
import screens from './screens';
import components from './components';

export default function setInitialState(options: PluginFunctions<'core'>) {
	const state: {
		[key: string]: (options: PluginFunctions<'core'>) => any;
	} = { screens, components };

	const { setResource, plugin } = options;
	for (const key of Object.keys(state)) {
		// @ts-ignore
		setResource(plugin[key], state[key](options));
	}
}

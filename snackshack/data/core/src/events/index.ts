import { PluginFunctions } from 'Plugin';

import gameEvents from './game';

export default (options: PluginFunctions<'core'>) => {
	gameEvents(options);
}

import { PluginFunctions } from 'Plugin';

import newGame from './newGame';
import startGame from './startGame';

export default (options: PluginFunctions<'core'>) => {
	newGame(options);
	startGame(options);
}

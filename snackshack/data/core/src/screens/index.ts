import { PluginFunctions } from 'Plugin';
import GameScreen from './GameScreen';
import NewGame from './NewGame';

export default function screens(options: PluginFunctions<'core'>): App.Plugins['core']['screens'] {
	return {
		game: GameScreen(options),
		newGame: NewGame(options),
	};
}

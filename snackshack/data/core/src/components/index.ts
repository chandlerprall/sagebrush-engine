import { PluginFunctions } from 'Plugin';
import GameHeader from './GameHeader';
import GameRenderer from './GameRenderer';

export default function screens(options: PluginFunctions<'core'>): App.Plugins['core']['components'] {
	return {
		header: GameHeader(options),
		renderer: GameRenderer(options),
	};
}

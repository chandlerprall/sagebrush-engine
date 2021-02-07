import MainScreen from './screens/MainScreen';
import GameScreen from './screens/GameScreen';

window.registerPlugin('app', function initPlugin({ log, state, setResource, dispatchEvent }) {
	log.enabled = true;
	log.level = 'debug';

	setResource(state.ui.screens.main, MainScreen({ dispatchEvent }));
	setResource(state.ui.screens.game, GameScreen);

	log.debug('initialized');

	return () => {
		log.debug('deinitialized');
	};
});

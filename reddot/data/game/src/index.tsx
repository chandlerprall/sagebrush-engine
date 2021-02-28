import MainScreen from './screens/MainScreen';
import GameScreen from './screens/GameScreen';
import { Button } from './Button';
import createPosition from './createPosition';

window.registerPlugin('reddot', function initPlugin(options) {
	const { log, onGetSaveData, onFromSaveData, onGetConfigData, onFromConfigData, app, plugin, getResource, setResource } = options;

	const defaultConfig: App.Plugins['reddot']['config'] = { highscore: 0 };

	log.enabled = true;
	log.level = 'debug';

	// interval to track the game counter
	let intervalId: NodeJS.Timeout;

	// save/restore whatever is in plugin.game
	onGetSaveData(() => getResource(plugin.game));
	onFromSaveData((data) => setResource(plugin.game, data));

	// config comes from plugin.config
	onGetConfigData(() => getResource(plugin.config) || defaultConfig);
	onFromConfigData((data) => setResource(plugin.config, data));

	function triggerSave() {
		const timestamp = Date.now();
		const { gametype, score, secondsRemaining } = getResource(plugin.game);
		app.dispatchEvent('SAVE', { id: 'latest', meta: { timestamp, score, gametype, secondsRemaining } });
	}

	// register event handlers
	plugin.onEvent('START_GAME', (config) => {
		if (config) {
			// initialize game data
			const { type } = config;
			setResource(plugin.game, {
				isGameOver: false,
				gametype: type,
				dot: createPosition(),
				score: 0,
				secondsRemaining: 300 // 5 minutes
			});
		}

		// move to game screen
		setResource(app.currentScreen, plugin.screens.game);

		clearInterval(intervalId); // just in case
		intervalId = setInterval(() => plugin.dispatchEvent('ADVANCE_TIME', null), 1000);
	});

	plugin.onEvent('RESUME_GAME', () => {
		app.dispatchEvent('LOAD_SAVE', { id: 'latest' });
		plugin.dispatchEvent('START_GAME', null);
	});

	plugin.onEvent('GAME_OVER', () => {
		app.dispatchEvent('DELETE_SAVE', { id: 'latest' })
		clearInterval(intervalId);
		setResource(plugin.game.isGameOver, true);
	});

	plugin.onEvent('ADVANCE_TIME', () => {
		const secondsRemaining = getResource(plugin.game.secondsRemaining);
		setResource(plugin.game.secondsRemaining, secondsRemaining - 1);
		triggerSave();
	});

	plugin.onEvent('DOT_CLICKED', () => {
		const score = getResource(plugin.game.score);
		const newScore = score + 1;
		setResource(plugin.game.score, newScore);
		setResource(plugin.game.dot, createPosition());
		triggerSave();

		const highscore = getResource(plugin.config.highscore) ?? 0;
		if (newScore > highscore) {
			setResource(plugin.config.highscore, newScore);
			app.dispatchEvent('SAVE_CONFIG', null);
		}
	});

	plugin.onEvent('GOTO_MENU', () => {
		clearInterval(intervalId);
		setResource(app.currentScreen, app.screens.main);
	});

	// register resources
	setResource(app.screens.main, MainScreen(options));
	setResource(plugin.screens.game, GameScreen(options));
	setResource(plugin.components.button, Button);

	log.debug('initialized');

	return () => {
		clearInterval(intervalId);
		log.debug('deinitialized');
	};
});

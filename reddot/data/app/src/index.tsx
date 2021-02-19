import { ComponentType } from 'react';
import MainScreen from './screens/MainScreen';
import GameScreen from './screens/GameScreen';
import createPosition from './createPosition';

declare global {
	namespace App {
		interface UiScreens {
			game: ComponentType
		}

		interface Data {
			game: {
				gametype: 'classic' | 'timed';
				dot: { top: number, left: number };
				score: number;
				secondsRemaining: number;
				isGameOver: boolean;
			};

			config?: {
				highscore: number;
			}
		}

		interface Events {
			START_GAME: { type: 'classic' | 'timed' } | null;
			RESUME_GAME: null;
			GAME_OVER: null;
			ADVANCE_TIME: null;
			DOT_CLICKED: null;
			GOTO_MENU: null;
		}
	}
}

window.registerPlugin('app', function initPlugin(options) {
	const { log, onGetSaveData, onFromSaveData, onGetConfigData, onFromConfigData, state, getResource, setResource, onEvent, dispatchEvent } = options;

	const defaultConfig: App.Data['config'] = { highscore: 0 };

	log.enabled = true;
	log.level = 'debug';

	// interval to track the game counter
	let intervalId: NodeJS.Timeout;

	// save/restore whatever is in state.data.game
	onGetSaveData(() => getResource(state.data.game));
	onFromSaveData((data) => setResource(state.data.game, data));

	// config comes from state.data.config
	onGetConfigData(() => getResource(state.data.config) || defaultConfig);
	onFromConfigData((data) => setResource(state.data.config, data));

	function triggerSave() {
		const timestamp = Date.now();
		const { gametype, score, secondsRemaining } = getResource(state.data.game);
		dispatchEvent('APP.SAVE', { id: 'latest', meta: { timestamp, score, gametype, secondsRemaining } });
	}

	// register event handlers
	onEvent('START_GAME', (config) => {
		if (config) {
			// initialize game data
			const { type } = config;
			setResource(state.data.game, {
				isGameOver: false,
				gametype: type,
				dot: createPosition(),
				score: 0,
				secondsRemaining: 300 // 5 minutes
			});
		}

		// move to game screen
		setResource(state.app.currentScreen, state.ui.screens.game);

		clearInterval(intervalId); // just in case
		intervalId = setInterval(() => dispatchEvent('ADVANCE_TIME', null), 1000);
	});

	onEvent('RESUME_GAME', () => {
		dispatchEvent('APP.LOAD_SAVE', { id: 'latest' });
		dispatchEvent('START_GAME', null);
	});

	onEvent('GAME_OVER', () => {
		dispatchEvent('APP.DELETE_SAVE', { id: 'latest' })
		clearInterval(intervalId);
		setResource(state.data.game.isGameOver, true);
	});

	onEvent('ADVANCE_TIME', () => {
		const secondsRemaining = getResource(state.data.game.secondsRemaining);
		setResource(state.data.game.secondsRemaining, secondsRemaining - 1);
		triggerSave();
	});

	onEvent('DOT_CLICKED', () => {
		const score = getResource(state.data.game.score);
		const newScore = score + 1;
		setResource(state.data.game.score, newScore);
		setResource(state.data.game.dot, createPosition());
		triggerSave();

		const highscore = getResource(state.data.config.highscore) ?? 0;
		if (newScore > highscore) {
			setResource(state.data.config.highscore, newScore);
			dispatchEvent('APP.SAVE_CONFIG', null);
		}
	});

	onEvent('GOTO_MENU', () => {
		clearInterval(intervalId);
		setResource(state.app.currentScreen, state.ui.screens.main);
	});

	// register resources
	setResource(state.ui.screens.main, MainScreen(options));
	setResource(state.ui.screens.game, GameScreen(options));

	log.debug('initialized');

	return () => {
		clearInterval(intervalId);
		log.debug('deinitialized');
	};
});

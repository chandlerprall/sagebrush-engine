import { ComponentType } from 'react';
import MainScreen from './screens/MainScreen';
import GameScreen from './screens/GameScreen';
import createPosition from './createPosition';

declare global {
	namespace App {
		interface Plugins {
			reddot: {
				screens: {
					game: ComponentType;
				};

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
		}
	}
}

declare global {
	namespace App {
		// interface UiScreens {
		// 	game: ComponentType
		// }
		//
		// interface Data {
		// 	game: {
		// 		gametype: 'classic' | 'timed';
		// 		dot: { top: number, left: number };
		// 		score: number;
		// 		secondsRemaining: number;
		// 		isGameOver: boolean;
		// 	};
		//
		// 	config?: {
		// 		highscore: number;
		// 	}
		// }

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

window.registerPlugin('reddot', function initPlugin(options) {
	const { log, onGetSaveData, onFromSaveData, onGetConfigData, onFromConfigData, app, store, getResource, setResource, onEvent, dispatchEvent } = options;

	const defaultConfig: App.Plugins['reddot']['config'] = { highscore: 0 };

	log.enabled = true;
	log.level = 'debug';

	// interval to track the game counter
	let intervalId: NodeJS.Timeout;

	// save/restore whatever is in store.game
	onGetSaveData(() => getResource(store.game));
	onFromSaveData((data) => setResource(store.game, data));

	// config comes from store.config
	onGetConfigData(() => getResource(store.config) || defaultConfig);
	onFromConfigData((data) => setResource(store.config, data));

	function triggerSave() {
		const timestamp = Date.now();
		const { gametype, score, secondsRemaining } = getResource(store.game);
		dispatchEvent('APP.SAVE', { id: 'latest', meta: { timestamp, score, gametype, secondsRemaining } });
	}

	// register event handlers
	onEvent('START_GAME', (config) => {
		if (config) {
			// initialize game data
			const { type } = config;
			setResource(store.game, {
				isGameOver: false,
				gametype: type,
				dot: createPosition(),
				score: 0,
				secondsRemaining: 300 // 5 minutes
			});
		}

		// move to game screen
		setResource(app.currentScreen, store.screens.game);

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
		setResource(store.game.isGameOver, true);
	});

	onEvent('ADVANCE_TIME', () => {
		const secondsRemaining = getResource(store.game.secondsRemaining);
		setResource(store.game.secondsRemaining, secondsRemaining - 1);
		triggerSave();
	});

	onEvent('DOT_CLICKED', () => {
		const score = getResource(store.game.score);
		const newScore = score + 1;
		setResource(store.game.score, newScore);
		setResource(store.game.dot, createPosition());
		triggerSave();

		const highscore = getResource(store.config.highscore) ?? 0;
		if (newScore > highscore) {
			setResource(store.config.highscore, newScore);
			dispatchEvent('APP.SAVE_CONFIG', null);
		}
	});

	onEvent('GOTO_MENU', () => {
		clearInterval(intervalId);
		setResource(app.currentScreen, app.screens.main);
	});

	// register resources
	setResource(app.screens.main, MainScreen(options));
	setResource(store.screens.game, GameScreen(options));

	log.debug('initialized');

	return () => {
		clearInterval(intervalId);
		log.debug('deinitialized');
	};
});

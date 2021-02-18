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
			gametype: 'classic' | 'timed';
			dot: { top: number, left: number };
			score: number;
			secondsRemaining: number;
			isGameOver: boolean;
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
	const { log, onGetSaveData, onFromSaveData, state, getResource, setResource, onEvent, dispatchEvent } = options;

	log.enabled = true;
	log.level = 'debug';

	// interval to track the game counter
	let intervalId: NodeJS.Timeout;

	// save/restore whatever is in state.data
	onGetSaveData(() => getResource(state.data));
	onFromSaveData((data) => setResource(state.data, data));

	function triggerSave() {
		const timestamp = Date.now();
		const { gametype, score, secondsRemaining } = getResource(state.data);
		dispatchEvent('APP.SAVE', { id: 'latest', meta: { timestamp, score, gametype, secondsRemaining } });
	}

	// register event handlers
	onEvent('START_GAME', (config) => {
		if (config) {
			// initialize game data
			const { type } = config;
			setResource(state.data, {
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
		setResource(state.data.isGameOver, true);
	});

	onEvent('ADVANCE_TIME', () => {
		const secondsRemaining = getResource(state.data.secondsRemaining);
		setResource(state.data.secondsRemaining, secondsRemaining - 1);
		triggerSave();
	});

	onEvent('DOT_CLICKED', () => {
		const score = getResource(state.data.score);
		setResource(state.data.score, score + 1);
		setResource(state.data.dot, createPosition());
		triggerSave();
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

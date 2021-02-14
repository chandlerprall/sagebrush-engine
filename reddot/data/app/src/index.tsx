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
			START_GAME: { type: 'classic' | 'timed' };
			GAME_OVER: null;
			ADVANCE_TIME: null;
			DOT_CLICKED: null;
		}
	}
}

window.registerPlugin('app', function initPlugin(options) {
	const { log, state, getResource, setResource, onEvent, dispatchEvent } = options;

	log.enabled = true;
	log.level = 'debug';

	let intervalId: NodeJS.Timeout;

	// register event handlers
	onEvent('START_GAME', ({ type }) => {
		// initialize game data
		setResource(state.data, {
			isGameOver: false,
			gametype: type,
			dot: createPosition(),
			score: 0,
			secondsRemaining: 300 // 5 minutes
		});

		// move to game screen
		setResource(state.app.currentScreen, state.ui.screens.game);

		clearInterval(intervalId); // just in case
		intervalId = setInterval(() => dispatchEvent('ADVANCE_TIME', null), 1000);
	});

	onEvent('GAME_OVER', () => {
		clearInterval(intervalId);
		setResource(state.data.isGameOver, true);
	});

	onEvent('ADVANCE_TIME', () => {
		const secondsRemaining = getResource(state.data.secondsRemaining);
		setResource(state.data.secondsRemaining, secondsRemaining - 1);
	});

	onEvent('DOT_CLICKED', () => {
		const score = getResource(state.data.score);
		setResource(state.data.score, score + 1);
		setResource(state.data.dot, createPosition());
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

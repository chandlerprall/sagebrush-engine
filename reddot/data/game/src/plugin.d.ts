import { Attributes, ButtonHTMLAttributes, ComponentType } from 'react';

export type ButtonProps = { css?: Attributes['css'], size?: 's' | 'l' } & ButtonHTMLAttributes<HTMLButtonElement>;

declare global {
	namespace App {
		interface Plugins {
			'game': {
				screens: {
					game: ComponentType;
				};

				components: {
					button: ComponentType<ButtonProps>;
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
		interface Events {
			'game': {
				START_GAME: { type: 'classic' | 'timed' } | null;
				RESUME_GAME: null;
				GAME_OVER: null;
				ADVANCE_TIME: null;
				DOT_CLICKED: null;
				GOTO_MENU: null;
			}
		}
	}
}

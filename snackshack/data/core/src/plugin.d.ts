import { ButtonHTMLAttributes, ComponentType } from 'react';

declare global {
	namespace UIPlugin {
		interface MenuButtons {
			test: ButtonHTMLAttributes<HTMLButtonElement>;
		}
	}

	namespace App {
		interface Plugins {
			core: {
				screens: {
					game: ComponentType;
					newGame: ComponentType;
				};

				components: {
					header: ComponentType;
					renderer: ComponentType;
				}

				game?: {
					name: string;
					money: number;
					isPaused: boolean;
				};
			};
		}

		interface Events {
			core: {
				newGame: null; // Open the "new game" screen
				startGame: { companyName: string }; // Start a new game
			};
		}
	}
}

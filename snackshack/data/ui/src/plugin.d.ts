import { ButtonHTMLAttributes, ComponentType } from 'react';

declare global {
	namespace App {
		interface Plugins {
			ui: {
				menu: {
					screen: ComponentType;
					title: ComponentType;
					layout: ComponentType;
					buttons: Array<ButtonHTMLAttributes<HTMLButtonElement>>;
				};
				button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>;
			};
		}
	}
}

declare global {
	namespace App {
		interface Events {
			ui: {}
		}
	}
}

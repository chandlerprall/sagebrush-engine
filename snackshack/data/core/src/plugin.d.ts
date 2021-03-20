import { ButtonHTMLAttributes, ComponentType } from 'react';

declare global {
	namespace App {
		interface Plugins {
			core: {
				ui: {
					button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>;
				};
			};
		}
	}
}

declare global {
	namespace App {
		interface Events {
			core: {

			}
		}
	}
}

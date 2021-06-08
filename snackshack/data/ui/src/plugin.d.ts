import {
	HTMLAttributes,
	ButtonHTMLAttributes,
	ComponentType,
	InputHTMLAttributes,
	ForwardRefExoticComponent, PropsWithoutRef, RefAttributes,
} from 'react';

declare global {
	namespace UIPlugin {
		interface MenuButtons {
			[id: string]: ButtonHTMLAttributes<HTMLButtonElement>;
			start: ButtonHTMLAttributes<HTMLButtonElement>;
			exit: ButtonHTMLAttributes<HTMLButtonElement>;
		}
	}

	namespace App {
		interface Plugins {
			ui: {
				button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>;
				input: ForwardRefExoticComponent<PropsWithoutRef<InputHTMLAttributes<HTMLInputElement> & { label: string }> & RefAttributes<HTMLInputElement>>;
				headedSection: ComponentType<HTMLAttributes<HTMLHeadingElement> & { title: string }>;
				menu: {
					screen: ComponentType;
					title: ComponentType;
					titleText: string;
					layout: ComponentType;
					buttons: UIPlugin.MenuButtons;
				};
				styles: {
					primary: string;

					success: string;
					danger: string;
					warning: string;

					border: string;

					focusOutline: string;
				}
			};
		}

		interface Events {
			ui: {};
		}
	}
}


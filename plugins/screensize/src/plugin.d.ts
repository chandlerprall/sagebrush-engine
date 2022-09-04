import { } from 'react';

declare global {
	namespace App {
		interface Plugins {
			screensize: {
				debounceTimeout: number;
			}
		}
	}
}

declare global {
	namespace App {
		interface Events {
			screensize: {
				RESIZE: { width: number, height: number }
			}
		}
	}
}

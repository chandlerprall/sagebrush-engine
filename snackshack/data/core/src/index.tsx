/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="@sagebrush/engine-client/types/insula" />
/// <reference types="@sagebrush/engine-client/types/app" />
/// <reference types="@sagebrush/plugin-ui/dist/plugin" />

import * as Three from 'three';
import setInitialState from './initialstate';
import attachEvents from './events';
import ui from './ui';

declare global {
	interface Window {
		Three: typeof Three;
	}
}
window.Three = Three;

window.registerPlugin('core', function initPlugin(options) {
	const { log } = options;
	log.enabled = true;
	log.level = 'debug';

	setInitialState(options);
	attachEvents(options);
	ui(options);
});

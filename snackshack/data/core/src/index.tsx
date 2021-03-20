/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="@sagebrush/engine-client/types/insula" />
/// <reference types="@sagebrush/engine-client/types/app" />
/// <reference types="@sagebrush/plugin-ui/dist/plugin" />

window.registerPlugin('core', function initPlugin(options) {
	const { log, setResource, app, getPlugin } = options;

	const ui = getPlugin('ui');

	log.enabled = true;
	log.level = 'debug';

	setResource(app.screens.main, ui.menu.screen);
});

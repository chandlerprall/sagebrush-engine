/// <reference types="@sagebrush/engine-client/types/insula" />
/// <reference types="@sagebrush/engine-client/types/app" />

interface ConfigShape {
	height: number;
	width: number;
}

window.registerPlugin('screensize', function initPlugin(options) {
	const { log, getResource, setResource, app, plugin, onGetConfigData, onFromConfigData } = options;

	setResource(plugin.debounceTimeout, 500);

	onGetConfigData(() => {
		log.debug(`configuring dimensions to ${window.outerWidth}x${window.outerHeight}`);
		return {
			height: window.outerHeight,
			width: window.outerWidth,
		} as ConfigShape;
	});

	onFromConfigData(({ height, width }: ConfigShape) => {
		log.debug(`resizing window to ${window.outerWidth}x${window.outerHeight}`);
		window.resizeTo(width, height);
	});

	let saveConfigTimeout: number | null = null;
	function applyConfig() {
		log.debug('triggering config update');
		saveConfigTimeout = null;
		app.dispatchEvent('SAVE_CONFIG', null);
	}

	const listener = () => {
		log.debug('debouncing config update');
		if (saveConfigTimeout != null) {
			clearTimeout(saveConfigTimeout);
		}
		saveConfigTimeout = setTimeout(applyConfig, getResource(plugin.debounceTimeout) as number | undefined);
	};
	window.addEventListener('resize', listener);
	return () => {
		window.removeEventListener('resize', listener);
	}
});

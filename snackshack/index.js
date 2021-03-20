const { join } = require('path');
const { start } = require('@sagebrush/engine');

start({
	indexFileLocation: join(__dirname, 'index.html'),
	pluginDirectory: join(__dirname, 'data'),

	// modify the default options when creating the Electron window
	getBrowserWindowConfig(config) {
		config.resizable = true;
		return config;
	},

	// called after the main application page has loaded
	onWindowLoad(window) {

	},
});

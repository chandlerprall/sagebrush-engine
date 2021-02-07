const { join } = require('path');
const { start } = require('sector-wrapper');

start({
	serverConfig: {
		indexFileLocation: join(__dirname, 'index.html'),
		pluginDirectory: join(__dirname, 'data'),
	},

	// modify the default options when creating the Electron window
	getBrowserWindowConfig(config) {
		return config;
	},

	// called after the main application page has loaded
	onWindowLoad(window) {

	},
});

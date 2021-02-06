const { join } = require('path');
const { start } = require('sector-wrapper');

start({
	indexFileLocation: join(__dirname, 'index.html'),
	pluginDirectory: join(__dirname, 'data'),
});

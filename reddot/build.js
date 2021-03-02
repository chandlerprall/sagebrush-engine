const { join } = require('path');
const buildForWeb = require('sector-wrapper/build');

buildForWeb({
	indexFileLocation: join(__dirname, 'index.html'),
	pluginDirectory: join(__dirname, 'data'),
	outputDir: join(__dirname, 'web'),
});

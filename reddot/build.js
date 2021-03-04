const { join } = require('path');
const buildForWeb = require('@sagebrush/engine/buildforweb');

buildForWeb({
	indexFileLocation: join(__dirname, 'index.html'),
	pluginDirectory: join(__dirname, 'data'),
	outputDir: join(__dirname, 'webbuild'),
	serverOrigin: 'http://localhost:8000',
});

const { join } = require('path');
const { start } = require('sector-wrapper');

start({
	pluginDirectory: join(__dirname, 'data'),
});

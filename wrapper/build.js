const { promises: { mkdir, copyFile, writeFile } } = require('fs');
const { join } = require('path');
const { copy } = require('fs-extra');
const { discoverPlugins } = require('../server/build/plugins');

async function buildForWeb(config) {
	const { indexFileLocation, pluginDirectory, outputDir } = config;
	const clientDir = join(__dirname, '..', 'client', 'build');

	// array of promises to await at the end
	const awaitables = [];

	// create the output dir
	await mkdir(outputDir, { recursive: true });

	// copy index file
	awaitables.push(copyFile(indexFileLocation, join(outputDir, 'index.html')));

	// copy client bundle
	awaitables.push(copy(join(clientDir, 'app-web.js'), join(outputDir, 'client', 'app.js')));

	// resolve plugin load order & write plugins manifest
	const plugins = await discoverPlugins(pluginDirectory);

	// copy plugins
	for (let i = 0; i < plugins.length; i++) {
		const plugin = plugins[i];
		const pluginDirectoryName = plugin.entry.split('/')[1];
		awaitables.push(copy(join(plugin.directory, 'dist'), join(outputDir, 'plugins', pluginDirectoryName)));
	}

	// write plugins manifest
	awaitables.push(writeFile(join(outputDir, 'plugins.json'), JSON.stringify(plugins.map(plugin => { delete plugin.directory; return plugin; }))));

	await Promise.all(awaitables);
}

module.exports = buildForWeb;

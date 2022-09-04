const { promises: { mkdir, copyFile, readFile, writeFile } } = require('fs');
const { join } = require('path');
const { copy } = require('fs-extra');
const cheerio = require('cheerio');
const { discoverPlugins } = require('@sagebrush/engine-server/build/plugins');
const makeCSP = require('./csp');

async function buildForWeb(config) {
	const { indexFileLocation, pluginDirectory, outputDir, serverOrigin, modifyCSP } = config;
	const clientDir = join(__dirname, '..', 'client', 'build');

	// array of promises to await at the end
	const awaitables = [];

	// create the output dir
	await mkdir(outputDir, { recursive: true });

	// process & write index file
	const indexContents = await readFile(indexFileLocation, 'utf-8');
	const indexHtml = cheerio.load(indexContents);

	const cspConfig = { isDevelopment: false, serverOrigin };
	let csp = makeCSP(cspConfig);
	if (modifyCSP) csp = modifyCSP(csp, cspConfig);
	indexHtml('head').append(`<meta http-equiv="Content-Security-Policy" content="${csp}">`);
	awaitables.push(writeFile(join(outputDir, 'index.html'), indexHtml.html()));

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

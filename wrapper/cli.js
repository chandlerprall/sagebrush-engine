#!/usr/bin/env node

const { existsSync, createWriteStream } = require('fs');
const { join } = require('path');
const { request } = require('http');
const tar = require('tar');

const [, , command, plugin_name] = process.argv;

const DATA_DIR = join(process.cwd(), 'data');
if (!existsSync(DATA_DIR)) {
	console.error('No data directory found to install plugin, are you sure this command was run from the root of a sagebrush project?');
	process.exit(1);
}

if (command === 'install-plugin' && plugin_name) {
	console.log(`Downloading ${plugin_name}`);
	const req = request(`http://127.0.0.1:54425/plugin/${plugin_name}`);

	req.on('error', (e) => {
		console.error(e);
		console.log('\nIs the plugin server running on 127.0.0.1:54425?')
		process.exit(1);
	});

	req.on('response', res => {
		if (res.statusCode !== 200) {
			console.error(`Download failed with response code ${res.statusCode}`);
			process.exit(1);
		}

		res.pipe(tar.extract({
			cwd: DATA_DIR,
		}));

		res.on('end',  () => {
			console.log('Installed');
		});
	});

	req.end();
} else {
	console.error('Correct usage is: sagebrush install-plugin pluginname');
	process.exit(1);
}

const { createServer } = require('http');
const { join } = require('path');
const { existsSync, createWriteStream } = require('fs');
const tar = require('tar');
const server = createServer();
server.listen(54425);

const PLUGINS_PATH = join(__dirname, '..', 'plugins');

server.on('request', (req, res) => {
	const path = req.url;

	const pluginRequest = req.url.match(/\/plugin\/(?<plugin>[^/]+)/);

	if (pluginRequest) {
		const { plugin } = pluginRequest.groups;

		const pluginDirectory = join(PLUGINS_PATH, plugin);
		const pluginManifestPath = join(pluginDirectory, 'manifest.json');
		const pluginPackagePath = join(pluginDirectory, 'package.json');
		const pluginDistPath = join(pluginDirectory, 'dist');
		if (existsSync(pluginManifestPath) && existsSync(pluginPackagePath) && existsSync(pluginDistPath)) {
			const pluginFileName = `${plugin}.tar.gz`;
			const t = new tar.Pack({
				gzip: true,
				portable: true,
				follow: true,
				file: pluginFileName,
				cwd: pluginDirectory,
				prefix: plugin,
			});

			res.statusCode = 200;
			res.setHeader('Content-Disposition', `attachment; ${pluginFileName}`);
			t.pipe(res);

			t.write('manifest.json');
			t.write('package.json');
			t.write('dist');

			t.on('finish', () => {
				res.end();
			});
			t.end();
		} else {
			FourOhFour(res);
		}
	} else {
		FourOhFour(res);
	}
});

function FourOhFour(res) {
	res.statusCode = 404;
	res.write('Plugin Not Found');
	res.end();
}

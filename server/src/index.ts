import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import SocketIo from 'socket.io';
import chokidar from 'chokidar';
// @ts-ignore
import findup from 'findup';
import { discoverPlugin, discoverPlugins } from './plugins';

const readFileAsync = promisify(readFile);

export const CLIENT_PATH = join(__dirname, '..', '..', 'client', 'build');
export const PLUGIN_PATH = join(__dirname, '..', '..', 'plugins');

export function startServer() {
	return new Promise(resolve => {
		const server = createServer();
		// @ts-ignore
		const io = SocketIo(server, { path: '/ws', serveClient: false });
		server.listen(() => resolve(server));

		io.on('connection', (client: SocketIo.Server) => {
			client.on('message', async (data) => {
				if (data == null || typeof data !== 'object') return;
				const { type } = data;

				if (type === 'DISCOVER_PLUGINS') {
					const plugins = await discoverPlugins();

					const pluginsToReload: string[] = [];
					let pluginsReloadTimeout: undefined | NodeJS.Timeout = undefined;
					async function performPluginsReload() {
						pluginsReloadTimeout = undefined;
						const foundPlugins = new Set<string>();
						for (let i = 0; i < pluginsToReload.length; i++) {
							const packagePath = pluginsToReload[i];
							if (foundPlugins.has(packagePath) === false) {
								foundPlugins.add(packagePath);
								client.send({
									type: 'RELOAD_PLUGIN',
									payload: await discoverPlugin(packagePath),
								});
							}
						}
						pluginsToReload.length = 0;
					}
					function schedulePluginReload(packagePath: string) {
						pluginsToReload.push(packagePath);
						if (pluginsReloadTimeout === undefined) {
							pluginsReloadTimeout = setTimeout(performPluginsReload, 1000);
						}
					}
					function reloadPlugin(path: string) {
						const packagePath = join(findup.sync(path, 'package.json'), 'package.json');
						schedulePluginReload(packagePath);
					}
					const pluginWatcher = chokidar.watch(
						PLUGIN_PATH,
						{
							disableGlobbing: true,
						}
					);
					pluginWatcher.on('ready', () => {
						pluginWatcher.on('add', reloadPlugin);
						pluginWatcher.on('change', reloadPlugin);
					});

					client.send({
						type: 'DISCOVER_PLUGINS_RESULT',
						payload: {
							plugins,
						},
					});
				}
			});
			client.on('disconnect', () => {});
		});

		server.on(
			'request',
			async (req: IncomingMessage, res: ServerResponse) => {
				const requestUrl = req.url || '/';

				if (requestUrl === '/') {
					const indexFile = await readFileAsync(join(__dirname, '..', 'index.html'));
					res.writeHead(200);
					res.end(indexFile);
				} else if (requestUrl.startsWith('/ws/')) {
					// automatically handled by socket.io
					return;
				} else if (requestUrl.startsWith('/client/') && requestUrl.indexOf('..') === -1) {
					const requestPath = requestUrl.replace('/client/', '');
					const requestTarget = join(CLIENT_PATH, requestPath);
					try {
						const file = await readFileAsync(requestTarget);
						res.writeHead(200);
						res.end(file);
					} catch {
						res.statusCode = 404;
						res.end();
					}
				} else if (requestUrl.startsWith('/plugins/')) {
					const requestPath = requestUrl.replace('/plugins/', '');
					const requestTarget = join(PLUGIN_PATH, requestPath);
					try {
						const file = await readFileAsync(requestTarget);
						res.writeHead(200);
						res.end(file);
					} catch {
						res.statusCode = 404;
						res.end();
					}
				} else {
					console.log('could not find', requestUrl);
					res.statusCode = 404;
					res.end();
				}
			},
		);
	});
}

import { app, BrowserWindowConstructorOptions } from 'electron';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { promises as fspromises } from 'fs';
import { join, dirname } from 'path';
import SocketIo from 'socket.io';
import chokidar from 'chokidar';
// @ts-ignore
import findup from 'findup';
import { discoverPlugin, discoverPlugins } from './plugins';

const { readFile, open, writeFile, mkdir, readdir, stat, unlink } = fspromises;

export const CLIENT_PATH = dirname(require.resolve('@sagebrush/engine-client'));

interface StartServerConfig {
	indexFileLocation: string;
	pluginDirectory: string;
	getBrowserWindowConfig: (config: BrowserWindowConstructorOptions) => BrowserWindowConstructorOptions
}
export function startServer(config: StartServerConfig) {
	const { indexFileLocation, pluginDirectory } = config;

	const userDataPath = app.getPath('userData');
	const savesPath = join(userDataPath, 'saves');
	const configFilePath = join(userDataPath, 'appconfig');

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
					const plugins = await discoverPlugins(pluginDirectory);

					const pluginsToReload: string[] = [];
					let pluginsReloadTimeout: undefined | NodeJS.Timeout = undefined;

					async function performPluginsReload() {
						pluginsReloadTimeout = undefined;
						const foundPlugins = new Set<string>();
						for (let i = 0; i < pluginsToReload.length; i++) {
							const manifestPath = pluginsToReload[i];
							if (foundPlugins.has(manifestPath) === false) {
								foundPlugins.add(manifestPath);
								client.send({
									type: 'RELOAD_PLUGIN',
									payload: await discoverPlugin(pluginDirectory, manifestPath),
								});
							}
						}
						pluginsToReload.length = 0;
					}

					function schedulePluginReload(manifestPath: string) {
						pluginsToReload.push(manifestPath);
						if (pluginsReloadTimeout === undefined) {
							pluginsReloadTimeout = setTimeout(performPluginsReload, 1000);
						}
					}

					function reloadPlugin(path: string) {
						const manifestPath = join(findup.sync(path, 'manifest.json'), 'manifest.json');
						schedulePluginReload(manifestPath);
					}

					const pluginWatcher = chokidar.watch(
						plugins.map(({ directory }) => join(directory, 'dist')),
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
				} else if (type === 'SAVE') {
					const { id, meta, data: savedata } = data.payload;

					await mkdir(savesPath, { recursive: true });

					const saveFilePath = join(savesPath, id);

					// file format:
					// [length of meta][:][meta][savedata]
					const metastring = JSON.stringify(meta);
					const datastring = JSON.stringify(savedata);

					const filehandle = await open(saveFilePath, 'w');
					await writeFile(filehandle, `${metastring.length}:${metastring}${datastring}`);
					await filehandle.close();
				} else if (type === 'GET_SAVES') {
					const entries = await readdir(savesPath);

					const savesMeta: Array<{ id: string, meta: any }> = [];
					for (let i = 0; i < entries.length; i++) {
						try {
							savesMeta.push(await readSaveMeta(entries[i]));
						} catch (e) {
							console.error(e)
						}
					}

					client.send({
						type: 'GET_SAVES_RESULT',
						payload: {
							saves: savesMeta,
						},
					});
				} else if (type === 'LOAD_SAVE') {
					const { id } = data.payload;
					try {
						client.send({
							type: 'LOAD_SAVE_RESULT',
							payload: await readSaveData(id)
						});
					} catch(e) {
						console.error(e);
					}
				} else if (type === 'DELETE_SAVE') {
					const { id } = data.payload;
					const saveFilePath = join(savesPath, id);
					try {
						await unlink(saveFilePath)
					} catch (e) {
						console.error(e);
					}
				} else if (type === 'SAVE_CONFIG') {
					const filehandle = await open(configFilePath, 'w');
					await writeFile(filehandle, JSON.stringify(data.payload));
					await filehandle.close();
				} else if (type === 'LOAD_CONFIG') {
					try {
						readFile
						const contents = await readFile(configFilePath);
						const config = JSON.parse(contents.toString());
						client.send({
							type: 'LOAD_CONFIG_RESULT',
							payload: config
						});
					} catch(e) {
						console.error(e);
					}
				} else if (type === 'EXIT') {
					app.exit();
				}
			});
			client.on('disconnect', () => {});
		});

		server.on(
			'request',
			async (req: IncomingMessage, res: ServerResponse) => {
				const requestUrl = req.url || '/';

				if (requestUrl === '/') {
					const indexFile = await readFile(indexFileLocation);
					res.writeHead(200);
					res.end(indexFile);
				} else if (requestUrl.startsWith('/ws/')) {
					// automatically handled by socket.io
					return;
				} else if (requestUrl.startsWith('/client/') && requestUrl.indexOf('..') === -1) {
					const requestPath = requestUrl.replace('/client/', '');
					const requestTarget = join(CLIENT_PATH, requestPath);
					try {
						const file = await readFile(requestTarget);
						res.writeHead(200);
						res.end(file);
					} catch {
						res.statusCode = 404;
						res.end();
					}
				} else if (requestUrl.startsWith('/plugins/')) {
					if (requestUrl.includes('/..')) {
						res.statusCode = 403;
						res.end();
					}
					const requestPath = requestUrl.replace('/plugins/', '');
					const requestPathSegments = requestPath.split('/');
					requestPathSegments.splice(1, 0, 'dist');
					const requestTarget = join(pluginDirectory, requestPathSegments.join('/'));
					try {
						const file = await readFile(requestTarget);
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

	async function readSaveMeta(id: string): Promise<{ id: string, meta: any }> {
		const savePath = join(savesPath, id);
		const filehandle = await open(savePath, 'r');
		const metasizeBuffer = Buffer.alloc(255);
		await filehandle.read(metasizeBuffer, 0, 255, 0);

		let metasizeString = '';
		for (let i = 0; metasizeBuffer.length; i++) {
			if (metasizeBuffer[i] === 58) {
				break;
			} else {
				metasizeString += String.fromCharCode(metasizeBuffer[i]);
			}
		}

		const metasize = parseInt(metasizeString, 10);

		const metaBuffer = Buffer.alloc(metasize);
		await filehandle.read(metaBuffer, 0, metasize, metasizeString.length + 1);
		const meta = JSON.parse(metaBuffer.toString());

		await filehandle.close();

		return { id, meta };
	}

	async function readSaveData(id: string): Promise<{ id: string, data: any }> {
		const savePath = join(savesPath, id);
		const filehandle = await open(savePath, 'r');
		const metasizeBuffer = Buffer.alloc(255);
		await filehandle.read(metasizeBuffer, 0, 255, 0);

		let metasizeString = '';
		for (let i = 0; metasizeBuffer.length; i++) {
			if (metasizeBuffer[i] === 58) {
				break;
			} else {
				metasizeString += String.fromCharCode(metasizeBuffer[i]);
			}
		}

		const metasize = parseInt(metasizeString, 10);

		const stats = await stat(savePath);
		const filebytes = stats.size;

		const nondataBytes = metasizeString.length + 1 + metasize;
		const databytes = filebytes - nondataBytes;

		const dataBuffer = Buffer.alloc(databytes);
		await filehandle.read(dataBuffer, 0, databytes, nondataBytes);
		const data = JSON.parse(dataBuffer.toString());

		await filehandle.close();

		return { id, data };
	}
}

const {app, BrowserWindow, session} = require('electron');
app.commandLine.appendSwitch ('disable-http-cache');

const { startServer } = require('@sagebrush/engine-server');
const makeCSP = require('./csp');

function start(config) {
	const { indexFileLocation, pluginDirectory, getBrowserWindowConfig, onWindowLoad } = config;
	const serverConfig = { indexFileLocation, pluginDirectory };

	const IS_DEVELOPMENT = true;

	function createWindow(serverPort) {
		const SERVER_ADDRESS = `http://localhost:${serverPort}`;
		session
			.defaultSession
			.setPermissionRequestHandler((webContents, permission, callback) => {
				// const url = webContents.getURL()

				// if (permission === 'notifications') {
				//     // Approves the permissions request
				//     callback(true)
				// }

				// Verify URL
				// if (!url.startsWith('https://example.com/')) {
				//     // Denies the permissions request
				//     return callback(false)
				// }

				console.log('blocking permission request', permission);
				callback(false);
			});

		session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
			const csp = makeCSP({ isDevelopment: IS_DEVELOPMENT, serverOrigin: SERVER_ADDRESS });
			callback({
				responseHeaders: {
					...details.responseHeaders,
					'Content-Security-Policy': [csp],
				},
			});
		});

		let windowConfig = {
			width: 800,
			height: 600,
			resizable: false,
			webPreferences: {
				sandbox: true,
				contextIsolation: true,
				devTools: IS_DEVELOPMENT,

				textAreasAreResizable: false,
			},
		};
		if (getBrowserWindowConfig != null) {
			windowConfig = getBrowserWindowConfig(windowConfig);
		}
		const win = new BrowserWindow(windowConfig);
		// win.setMenu(null);
		if (IS_DEVELOPMENT) {
			win.webContents.openDevTools({
				mode: 'detach',
				activate: true,
			});
		}

		// to show something immediately, load the placeholder initializing file first
		// and then load the actual application
		win.loadFile('initializing.html').then(() => {
			win.loadURL(SERVER_ADDRESS).then(() => {
				if (onWindowLoad != null) onWindowLoad(win);
			});
		});
	}

	let server;
	const startupPromises = [startServer(serverConfig), app.whenReady()];
	Promise.all(startupPromises).then(([_server]) => {
		server = _server;
		const serverPort = server.address().port;
		createWindow(serverPort);
	});

	app.on('window-all-closed', () => {
		if (server != null) server.close();
		app.quit();
	});

	app.on('web-contents-created', (event, contents) => {
		contents.on('will-navigate', (event, navigationUrl) => {
			event.preventDefault();
		});
	});
}

module.exports = { start };

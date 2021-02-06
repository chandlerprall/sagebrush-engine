const {app, BrowserWindow, session} = require('electron');
app.commandLine.appendSwitch ('disable-http-cache');

const { startServer } = require('../server/build');

function start(config) {
	const { indexFileLocation, pluginDirectory } = config;

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
			const csp = IS_DEVELOPMENT
				// lax CSP required for devtools
				? `default-src 'none'; connect-src ${SERVER_ADDRESS.replace('http', 'ws')}; script-src ${SERVER_ADDRESS} 'sha256-/fXMeAizDJK+4tDvd/8824gAqTphH6OAa7eWO0eSx60=' devtools: 'unsafe-eval'; style-src 'unsafe-inline'; img-src devtools:;`
				: `default-src 'none'; connect-src ${SERVER_ADDRESS} script-src ${SERVER_ADDRESS}`;
			callback({
				responseHeaders: {
					...details.responseHeaders,
					'Content-Security-Policy': [csp],
				},
			});
		});

		const win = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				sandbox: true,
				contextIsolation: true,
				devTools: IS_DEVELOPMENT,

				textAreasAreResizable: false,
			},
		});
		if (IS_DEVELOPMENT) {
			win.webContents.openDevTools({
				mode: 'detach',
				activate: true,
			});
		}

		// to show something immediately, load the placeholder initializing file first
		// and then load the actual application
		win.loadFile('initializing.html').then(() => {
			win.loadURL(SERVER_ADDRESS);
		});
	}

	let server;
	const startupPromises = [startServer({ indexFileLocation, pluginDirectory }), app.whenReady()];
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

module.exports = {
	start,
};

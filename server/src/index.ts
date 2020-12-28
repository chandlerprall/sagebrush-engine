import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import * as SocketIo from 'socket.io';

const readFileAsync = promisify(readFile);

const CLIENT_PATH = join(__dirname, '..', '..', 'client', 'build');

export function startServer() {
	return new Promise(resolve => {
		const server = createServer();
		// @ts-ignore
		const io = SocketIo(server, { path: '/ws', serveClient: false });
		server.listen(() => resolve(server));

		io.on('connection', (client: SocketIo.Server) => {
			console.log('socket connected');
			client.on('message', (data) => { console.log('message\n', data) });
			client.on('disconnect', () => { /* … */ });
			client.send({ test: 'back' })
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
				} else {
					console.log('could not find', requestUrl);
					res.statusCode = 404;
					res.end();
				}
			},
		);
	});
}

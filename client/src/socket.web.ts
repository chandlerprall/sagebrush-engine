function isValidMessage(data: any): data is { type: keyof App.Messages.FromServer, payload: App.Messages.FromServer[keyof App.Messages.FromServer] } {
	if (data == null || typeof data !== 'object') return false;
	return data.hasOwnProperty('type') &&  data.hasOwnProperty('payload');
}

function onSocketMessage(data: any) {
	if (isValidMessage(data)) {
		const { type, payload } = data;
		const listeners = messageListeners[type];
		if (listeners == null) return;
		for (let i = 0; i < listeners.length; i++) {
			listeners[i](payload);
		}
	}
}

const messageListeners: { [key: string]: Array<Function> } = {};
export function onMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void) {
	if (!messageListeners.hasOwnProperty(message)) messageListeners[message] = [];
	messageListeners[message].push(listener);
}
export function offMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void) {
	if (!messageListeners.hasOwnProperty(message)) return;
	const listeners = messageListeners[message];
	for (let i = 0; i < listeners.length; i++) {
		if (listeners[i] === listener) {
			listeners.splice(i, 1);
			return;
		}
	}
}

export async function messageServer<Message extends keyof App.Messages.FromClient>(type: Message, payload: App.Messages.FromClient[Message]) {
	if (type === 'DISCOVER_PLUGINS') {
		const plugins = await fetch('plugins.json').then(response => response.json());
		onSocketMessage({
			type: 'DISCOVER_PLUGINS_RESULT',
			payload: {
				plugins,
			},
		})
	} else if (type === 'EXIT') {
		window.close();
	} else if (type === 'SAVE') {
		const { meta, data: savedata } = payload as App.Messages.FromClient['SAVE'];
		const metastring = JSON.stringify(meta);
		const datastring = JSON.stringify(savedata);
		const save = `${metastring.length}:${metastring}${datastring}`;
		localStorage.setItem('save', save);
	} else if (type === 'GET_SAVES') {
		const response: App.Messages.FromServer['GET_SAVES_RESULT'] = { saves: [] };

		const save = localStorage.getItem('save');
		if (save != null) {
			let metasizeString = '';
			for (let i = 0; i < save.length; i++) {
				const char = save[i];
				if (char === ':') {
					break;
				} else {
					metasizeString += char;
				}
			}
			const metasize = parseInt(metasizeString, 10);

			const metaString = save.substr(metasizeString.length + 1, metasize);
			const meta = JSON.parse(metaString.toString());
			response.saves.push({ id: 'save', meta });
		}

		onSocketMessage({ type: 'GET_SAVES_RESULT', payload: response });
	} else if (type === 'LOAD_SAVE') {
		const { id } = payload as App.Messages.FromClient['LOAD_SAVE'];
		const save = localStorage.getItem('save')!;

		let metasizeString = '';
		for (let i = 0; i < save.length; i++) {
			const char = save[i];
			if (char === ':') {
				break;
			} else {
				metasizeString += char;
			}
		}
		const metasize = parseInt(metasizeString, 10);

		const nondataBytes = metasizeString.length + 1 + metasize;

		const dataString = save.substr(nondataBytes);
		const data = JSON.parse(dataString.toString());

		onSocketMessage({ type: 'LOAD_SAVE_RESULT', payload: { id, data } });
	} else if (type === 'DELETE_SAVE') {
		localStorage.removeItem('save');
	} else if (type === 'SAVE_CONFIG') {
		localStorage.setItem('config', JSON.stringify(payload));
	} else if (type === 'LOAD_CONFIG') {
		const raw = localStorage.getItem('config');
		if (raw) {
			onSocketMessage({ type: 'LOAD_CONFIG_RESULT', payload: JSON.parse(raw) });
		}
	}
}

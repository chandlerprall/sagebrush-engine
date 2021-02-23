import { app, getResource, setResource } from './state';
import { messageServer, onMessage } from './socket';
import { collectPluginConfigData, collectPluginSaveData, setPluginConfigData, setPluginSaveData } from './plugins';
import Plugin, { SaveableData } from './Plugin';

declare global {
	namespace App {
		interface Events {
			app: {
				EXIT: null;
				SAVE: { id: string, meta: SaveableData };
				GET_SAVES: null;
				LOAD_SAVE: { id: string };
				DELETE_SAVE: { id: string };
				SAVE_CONFIG: null;
				LOAD_CONFIG: null;

				LOAD_PLUGINS: null;
				PLUGIN_LOADED: Plugin<string>;
				INITIALIZE_PLUGINS: null;
				FINISHED_LOADING_PLUGINS: null;
			}
		}
	}
}

app.onEvent('EXIT', () => {
	messageServer('EXIT', null);
});

app.onEvent('SAVE', ({ id, meta }) => {
	const data = collectPluginSaveData();
	messageServer('SAVE', { id, meta, data });
});

app.onEvent('GET_SAVES', () => {
	messageServer('GET_SAVES', null);
});
onMessage('GET_SAVES_RESULT', ({ saves }) => {
	setResource(app.saves, saves);
});

let lastSaveId: string;
app.onEvent('LOAD_SAVE', ({ id }) => {
	setResource(app.isLoadingSave, true);
	lastSaveId = id;
	messageServer('LOAD_SAVE', { id });
});
onMessage('LOAD_SAVE_RESULT', ({ id, data }) => {
	if (id === lastSaveId) {
		setPluginSaveData(data);
		setResource(app.isLoadingSave, false);
	}
});

app.onEvent('DELETE_SAVE', ({ id }) => {
	messageServer('DELETE_SAVE', { id });

	const saves = getResource(app.saves);
	const newSaves = saves.filter(({ id: saveId }) => saveId !== id);
	setResource(app.saves, newSaves);
});

app.onEvent('SAVE_CONFIG', () => {
	const data = collectPluginConfigData();
	messageServer('SAVE_CONFIG', data);
});
app.onEvent('LOAD_CONFIG', () => {
	messageServer('LOAD_CONFIG', null);
});
onMessage('LOAD_CONFIG_RESULT', (data) => {
	setPluginConfigData(data);
});

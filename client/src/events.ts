import { onEvent, state, getResource, setResource } from './state';
import { messageServer, onMessage } from './socket';
import { collectPluginConfigData, collectPluginSaveData, setPluginConfigData, setPluginSaveData } from './plugins';
import { SaveableData } from './Plugin';

declare global {
	namespace App {
		interface Events {
			'APP.EXIT': null;
			'APP.SAVE': { id: string, meta: SaveableData };
			'APP.GET_SAVES': null;
			'APP.LOAD_SAVE': { id: string };
			'APP.DELETE_SAVE': { id: string };
			'APP.SAVE_CONFIG': null;
			'APP.LOAD_CONFIG': null;
		}
	}
}

onEvent('APP.EXIT', () => {
	messageServer('EXIT', null);
});

onEvent('APP.SAVE', ({ id, meta }) => {
	const data = collectPluginSaveData();
	messageServer('SAVE', { id, meta, data });
});

onEvent('APP.GET_SAVES', () => {
	messageServer('GET_SAVES', null);
});
onMessage('GET_SAVES_RESULT', ({ saves }) => {
	setResource(state.saves, saves);
});

let lastSaveId: string;
onEvent('APP.LOAD_SAVE', ({ id }) => {
	setResource(state.isLoadingSave, true);
	lastSaveId = id;
	messageServer('LOAD_SAVE', { id });
});
onMessage('LOAD_SAVE_RESULT', ({ id, data }) => {
	if (id === lastSaveId) {
		setPluginSaveData(data);
		setResource(state.isLoadingSave, false);
	}
});

onEvent('APP.DELETE_SAVE', ({ id }) => {
	messageServer('DELETE_SAVE', { id });

	const saves = getResource(state.saves);
	const newSaves = saves.filter(({ id: saveId }) => saveId !== id);
	setResource(state.saves, newSaves);
});

onEvent('APP.SAVE_CONFIG', () => {
	const data = collectPluginConfigData();
	messageServer('SAVE_CONFIG', data);
});
onEvent('APP.LOAD_CONFIG', () => {
	messageServer('LOAD_CONFIG', null);
});
onMessage('LOAD_CONFIG_RESULT', (data) => {
	setPluginConfigData(data);
});

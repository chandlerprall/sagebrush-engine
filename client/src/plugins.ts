import { app, setResource, getResource, Accessor, Eventable } from './state';
import { messageServer, onMessage, offMessage } from './socket';
import Plugin, { PluginFunctions, SaveableData } from './Plugin';
import Log from './Log';

const log = new Log('plugins');

declare global {
	namespace App {
		interface PluginDefinition {
			name: string;
			version: string;
			description: string;
			entry: string;
		}
	}
}

const plugins = new Map<string, Plugin<string>>();

export const registerPlugin = <PluginName extends string>(name: PluginName, initializer: (arg: PluginFunctions<PluginName>) => void | (() => void) | Promise<void> | Promise<() => void>): void | Promise<void> => {
	const plugin = plugins.get(name);
	if (plugin == null) {
		log.error(`No matching plugin for "${name}" orchestration`);
	} else {
		plugin.initializer = initializer as any;
	}
};

export function getPlugin<PluginName extends string, ReturnType = Accessor<App.Plugins[PluginName]> & Eventable<App.Events[PluginName]>>(pluginName: PluginName): ReturnType {
	if (pluginName === 'app') return app as any;
	const pluginsArray = plugins.entries();
	for (const [name, plugin] of pluginsArray) {
		if (name === pluginName) {
			return plugin.accessor as any;
		}
	}
	log.error(`getPlugin requested "${pluginName}" but that plugin does not exist`);
	return undefined as unknown as ReturnType;
}

export function collectPluginSaveData() {
	const data: { [key: string]: SaveableData } = {};
	log.debug('collecting plugin save data');
	const pluginsArray = plugins.entries();
	for (const [name, plugin] of pluginsArray) {
		log.debug(`getting save data from ${name}`);
		const pluginData = plugin.getSaveData?.();
		if (pluginData) {
			log.debug(pluginData);
			data[name] = pluginData;
		}
	}
	return data;
}
export function setPluginSaveData(data: { [key: string]: SaveableData }) {
	const pluginsArray = plugins.entries();
	for (const [name, plugin] of pluginsArray) {
		if (plugin.fromSaveData && data.hasOwnProperty(name)) {
			plugin.fromSaveData(data[name]);
		}
	}
}

export function collectPluginConfigData() {
	const data: { [key: string]: SaveableData } = {};
	log.debug('collecting plugin config data');
	const pluginsArray = plugins.entries();
	for (const [name, plugin] of pluginsArray) {
		log.debug(`getting config data from ${name}`);
		const pluginData = plugin.getConfigData?.();
		if (pluginData) {
			log.debug(pluginData);
			data[name] = pluginData;
		}
	}
	return data;
}
export function setPluginConfigData(data: { [key: string]: SaveableData }) {
	const pluginsArray = plugins.entries();
	for (const [name, plugin] of pluginsArray) {
		if (plugin.fromConfigData && data.hasOwnProperty(name)) {
			plugin.fromConfigData(data[name]);
		}
	}
}

app.onEvent('LOAD_PLUGINS', () => {
	const onDiscoverPluginsResult: (payload: App.Messages.FromServer['DISCOVER_PLUGINS_RESULT']) => void = async ({ plugins: discoveredPlugins }) => {
		offMessage('DISCOVER_PLUGINS_RESULT', onDiscoverPluginsResult);
		setResource(app.plugins.discovered, discoveredPlugins);

		for (let i = 0; i < discoveredPlugins.length; i++) {
			const pluginDef = discoveredPlugins[i];
			const plugin = new Plugin(pluginDef);
			plugins.set(pluginDef.name, plugin);
			await plugin.loadingPromise;
		}

		app.dispatchEvent('INITIALIZE_PLUGINS', null);
	};

	onMessage('DISCOVER_PLUGINS_RESULT', onDiscoverPluginsResult);
	messageServer('DISCOVER_PLUGINS', null);
});

app.onEvent('PLUGIN_LOADED', plugin => {
	const loadedPlugins = [...getResource(app.plugins.loaded), plugin];
	setResource(app.plugins.loaded, loadedPlugins);
});

app.onEvent('INITIALIZE_PLUGINS', async () => {
	const discoveredPlugins = getResource(app.plugins.discovered);

	try {
		for (let i = 0; i < discoveredPlugins.length; i++) {
			const pluginDefinition = discoveredPlugins[i];
			const plugin = plugins.get(pluginDefinition.name)!;
			await plugin.initialize();
			app.dispatchEvent('PLUGIN_LOADED', plugin);
		}

		log.info('plugins initialized');
		app.dispatchEvent('LOAD_CONFIG', null);
		setResource(app.currentScreen, app.screens.main);
	} catch (e) {
		setResource(app.loadingError, (e as Error).toString());
	}
});

onMessage('RELOAD_PLUGIN', async (pluginDef) => {
	const plugin = plugins.get(pluginDef.name);
	if (plugin === undefined) {
		log.error(`Cannot reload plugin "${pluginDef.name}": plugin not loaded`);
		return;
	}

	plugin.deinitialize();

	plugin.version = pluginDef.version;
	plugin.description = pluginDef.description;
	plugin.entry = pluginDef.entry;

	await plugin.load();
	await plugin.initialize();
});

import { state, onEvent, dispatchEvent, setResource, getResource } from './state';
import { messageServer, onMessage, offMessage } from './socket';
import Plugin, { PluginFunctions } from './Plugin';

declare global {
	namespace App {
		interface PluginDefinition {
			name: string;
			version: string;
			description: string;
			entry: string;
		}

		interface PluginOrchestration {
			initialize(fns: PluginFunctions): void | Promise<void>;
			deinitialize(fns: PluginFunctions): void;
		}

		interface State {
			plugins: {
				discovered: PluginDefinition[];
				loaded: Plugin[];
			};
		}

		interface Events {
			LOAD_PLUGINS: null;
			PLUGIN_LOADED: Plugin;
			INITIALIZE_PLUGINS: null;
		}
	}
}

declare global {
	interface Window {
		registerPlugin(name: string, orchestration: App.PluginOrchestration): void;
	}
}
const plugins = new Map<string, Plugin>();
window.registerPlugin = (name, orchestration: App.PluginOrchestration) => {
	const plugin = plugins.get(name);
	if (plugin == null) {
		console.error(`No matching plugin for "${name}" orchestration`);
	} else {
		plugin.orchestration = orchestration;
	}
};

onEvent('LOAD_PLUGINS', () => {
	const onDiscoverPluginsResult: (payload: App.Messages.FromServer['DISCOVER_PLUGINS_RESULT']) => void = ({ plugins: discoveredPlugins }) => {
		offMessage('DISCOVER_PLUGINS_RESULT', onDiscoverPluginsResult);
		setResource(state.plugins.discovered, discoveredPlugins);

		for (let i = 0; i < discoveredPlugins.length; i++) {
			const pluginDef = discoveredPlugins[i];
			const plugin = new Plugin(pluginDef);
			plugins.set(pluginDef.name, plugin);
			plugin.loadingPromise.then(() => {
				dispatchEvent('PLUGIN_LOADED', plugin);
			});
		}
	};

	onMessage('DISCOVER_PLUGINS_RESULT', onDiscoverPluginsResult);
	messageServer('DISCOVER_PLUGINS', {});
});

onEvent('PLUGIN_LOADED', plugin => {
	const loadedPlugins = getResource(state.plugins.loaded);
	loadedPlugins.push(plugin);
	setResource(state.plugins.loaded, loadedPlugins);

	const discoveredPluginsCount = getResource((state.plugins.loaded.length));
	if (discoveredPluginsCount === loadedPlugins.length) {
		dispatchEvent('INITIALIZE_PLUGINS', null);
	}
});

onEvent('INITIALIZE_PLUGINS', () => {
	const loadedPlugins = getResource(state.plugins.loaded);
	const initPromises: Array<Promise<void>> = [];
	for (let i = 0; i < loadedPlugins.length; i++) {
		const plugin = loadedPlugins[i] as Plugin;
		initPromises.push(plugin.initialize());
	}
	Promise.all(initPromises)
		.then(() => {
			console.log('plugins initialized');
		})
		.catch(e => {
			console.error(e);
		});
});
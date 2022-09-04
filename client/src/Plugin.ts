import Store from 'insula';
import {
	getResource,
	useResource,
	setResource,
	subscribeToResource,
	app,
	Accessor,
	makeAccessor,
	Eventable,
	storeKeyMap,
} from './state';
import Log from './Log';
import { getPlugin } from './plugins';

export type SaveableData = any;

declare global {
	namespace App {
		interface Plugins {
			[key: string]: Object;
		}

		interface Events {
			[key: string]: Object;
		}
	}
}

export interface PluginFunctions<PluginName extends string> {
	getPlugin: <GottenPlugin extends string>(pluginName: GottenPlugin) => Accessor<App.Plugins[GottenPlugin]> & Eventable<App.Events[GottenPlugin]>;
	app: typeof app;
	plugin: Accessor<App.Plugins[PluginName]> & Eventable<App.Events[PluginName]>;
	useResource: typeof useResource,
	getResource: typeof getResource,
	setResource: typeof setResource,
	subscribeToResource: typeof subscribeToResource,
	onGetSaveData: (fn: () => SaveableData) => void,
	onFromSaveData: (fn: (data: SaveableData) => void) => void,
	onGetConfigData: (fn: () => SaveableData) => void,
	onFromConfigData: (fn: (data: SaveableData) => void) => void,
	log: Log;

	devData: any,
	onDevReload: (fn: () => any) => void,
}

export default class Plugin<PluginName extends string> {
	public name: PluginName;
	public description: string;
	public version: string;
	public entry: string;
	public getSaveData: (() => SaveableData) | undefined;
	public fromSaveData: ((data: SaveableData) => void) | undefined;
	public getConfigData: (() => SaveableData) | undefined;
	public fromConfigData: ((data: SaveableData) => void) | undefined;

	private getDevData: (() => any) | undefined;
	private devData: any;

	private log: Log;
	private eventSubscriptions: Array<[store: Store<any>, event: string, listener: Function]> = [];
	private resourceSubscriptions: Array<() => void> = [];
	private store: Store<App.Plugins[PluginName]>;
	public accessor: Accessor<App.Plugins[PluginName]> & Eventable<App.Events[PluginName]>;

	public initializer?: (args: PluginFunctions<PluginName>) => void | (() => void);
	private uninitializer?: void | (() => void);

	isLoaded: boolean;
	loadingPromise: Promise<undefined | Event | string>;

	constructor(definition: App.PluginDefinition) {
		this.name = definition.name as PluginName;
		this.description = definition.description;
		this.version = definition.version;
		this.entry = definition.entry;
		this.log = new Log(`Plugin(${this.name})`);

		this.store = new Store<App.Plugins[PluginName]>({});
		storeKeyMap.set(this.store, this.name);

		this.accessor = makeAccessor<App.Plugins[PluginName], App.Events[PluginName]>(this.store) as any;

		this.isLoaded = false;
		this.loadingPromise = this.load();
		this.loadingPromise.then(() => this.isLoaded = true);
	}

	private getPlugin = <GottenPlugin extends string>(pluginName: GottenPlugin): Accessor<App.Plugins[GottenPlugin]> & Eventable<App.Events[GottenPlugin]> => {
		const pluginAccessor = getPlugin(pluginName);
		const store = (pluginAccessor as any).__store;

		// intercept onEvent so they can be managed when the calling plugin is unloads
		const onEvent = (event: string, listener: Function) => {
			this.eventSubscriptions.push([store, event, listener]);
			store.on(event, listener);
		}
		const proxy = new Proxy(
			pluginAccessor,{
				get(target, prop: string, reciever) {
					if (prop === 'onEvent') return onEvent;
					return Reflect.get(target, prop, reciever);
				}
			}
		);

		return proxy;
	}

	private setOnGetSaveData = (onGetSaveData: () => SaveableData) => {
		this.getSaveData = onGetSaveData;
	}

	private setOnFromSaveData = (onFromSaveData: (data: SaveableData) => void) => {
		this.fromSaveData = onFromSaveData;
	}

	private setOnGetConfigData = (onGetConfigData: () => SaveableData) => {
		this.getConfigData = onGetConfigData;
	}

	private setOnFromConfigData = (onFromConfigData: (data: SaveableData) => void) => {
		this.fromConfigData = onFromConfigData;
	}

	private subscribeToResource = <GottenPlugin extends string>(accessor: Accessor<App.Plugins[GottenPlugin]>, listener: (value: any) => void, callImmediately: boolean = false) => {
		const unsubscribe = subscribeToResource(
			accessor,
			([value]) => {
				listener(value);
			},
			callImmediately
		);
		this.resourceSubscriptions.push(unsubscribe);
		return unsubscribe;
	}

	private setOnDevReload = (onDevReload: () => any) => {
		this.getDevData = onDevReload;
	}

	async load(): Promise<undefined | Event | string> {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.onload = () => {
				this.log.debug('loaded');
				resolve(undefined);
			};
			script.onerror = (e) => {
				this.log.error(`failed to load: ${e.toString()}`);
				reject(e);
			};
			script.type = 'text/javascript';
			script.src = this.entry;
			document.head.appendChild(script);
		});
	}

	async initialize(): Promise<any> {
		if (this.initializer === undefined) {
			this.log.error('initialize called without an initializer');
		} else {
			this.uninitializer = await this.initializer({
				app: this.getPlugin('app') as any,
				plugin: this.getPlugin(this.name),
				getPlugin: this.getPlugin,
				onGetSaveData: this.setOnGetSaveData,
				onFromSaveData: this.setOnFromSaveData,
				onGetConfigData: this.setOnGetConfigData,
				onFromConfigData: this.setOnFromConfigData,
				log: this.log,
				getResource,
				setResource,
				useResource,
				subscribeToResource: this.subscribeToResource,

				devData: this.devData,
				onDevReload: this.setOnDevReload,
			});
		}
	}

	deinitialize(): void {
		if (this.getDevData) this.devData = this.getDevData();
		if (this.uninitializer) this.uninitializer();

		// remove any event subscriptions
		for (let i = 0; i < this.eventSubscriptions.length; i++) {
			const [store, event, listener] = this.eventSubscriptions[i];
			store.off(event, listener as any);
		}
		this.eventSubscriptions.length = 0;

		// remove any resource subscriptions (via subscribeToResource, not useResource)
		for (let i = 0; i < this.resourceSubscriptions.length; i++) {
			this.resourceSubscriptions[i]();
		}
	}
}

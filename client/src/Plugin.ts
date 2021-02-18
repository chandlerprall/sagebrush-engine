import { onEvent, offEvent, dispatchEvent, getResource, useResource, setResource, state } from './state';
import Log from './Log';

export type SaveableData = Object | Array<any>;

export interface PluginFunctions {
	state: typeof state;
	dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
	onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
	offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
	useResource: typeof useResource,
	getResource: typeof getResource,
	setResource: typeof setResource,
	onGetSaveData: (fn: () => SaveableData) => void,
	onFromSaveData: (fn: (data: SaveableData) => void) => void,
	log: Log;
}

export default class Plugin {
	public name: string;
	public description: string;
	public version: string;
	public entry: string;
	public getSaveData: (() => SaveableData) | undefined;
	public fromSaveData: ((data: SaveableData) => void) | undefined;

	private log: Log;
	private eventSubscriptions: Array<[string, Function]> = [];

	public initializer?: (args: PluginFunctions) => void | (() => void);
	private uninitializer?: void | (() => void);

	private dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]) {
		dispatchEvent(event, payload);
	}
	private onEvent = <Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void) => {
		this.eventSubscriptions.push([event, listener]);
		onEvent(event, listener);
	}
	private offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void) {
		offEvent(event, listener);
	}

	private pluginFunctions: PluginFunctions;

	isLoaded: boolean;
	loadingPromise: Promise<undefined | Event | string>;

	constructor(definition: App.PluginDefinition) {
		this.name = definition.name;
		this.description = definition.description;
		this.version = definition.version;
		this.entry = definition.entry;
		this.log = new Log(`Plugin(${this.name})`);

		this.pluginFunctions = {
			state,
			dispatchEvent: this.dispatchEvent,
			onEvent: this.onEvent,
			offEvent: this.offEvent,
			onGetSaveData: this.setOnGetSaveData,
			onFromSaveData: this.setOnFromSaveData,
			log: this.log,
			getResource,
			setResource,
			useResource,
		};

		this.isLoaded = false;
		this.loadingPromise = this.load();
		this.loadingPromise.then(() => this.isLoaded = true);
	}

	private setOnGetSaveData = (onGetSaveData: () => SaveableData) => {
		this.getSaveData = onGetSaveData;
	}

	private setOnFromSaveData = (onFromSaveData: (data: SaveableData) => void) => {
		this.fromSaveData = onFromSaveData;
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
			this.uninitializer = this.initializer(this.pluginFunctions);
		}
	}

	deinitialize(): void {
		if (this.uninitializer) this.uninitializer();

		for (let i = 0; i < this.eventSubscriptions.length; i++) {
			const [event, listener] = this.eventSubscriptions[i];
			// @ts-ignore
			offEvent(event, listener);
		}
	}
}

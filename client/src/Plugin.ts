import { onEvent, offEvent, dispatchEvent } from './state';

export interface PluginFunctions {
	dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
	onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
	offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
}

export default class Plugin {
	private name: string;
	// private description: string;
	// private version: string;
	private entry: string;
	private orchestrator?: App.PluginOrchestration;

	private subscriptions: Array<[string, Function]> = [];

	private dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]) {
		dispatchEvent(event, payload);
	}
	private onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void) {
		this.subscriptions.push([event, listener]);
		onEvent(event, listener);
	}
	private offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void) {
		offEvent(event, listener);
	}

	private pluginFunctions: PluginFunctions = {
		dispatchEvent: this.dispatchEvent,
		onEvent: this.onEvent,
		offEvent: this.offEvent,
	};

	isLoaded: boolean;
	loadingPromise: Promise<undefined | Event | string>;

	constructor(definition: App.PluginDefinition) {
		this.name = definition.name;
		// this.description = definition.description;
		// this.version = definition.version;
		this.entry = definition.entry;

		this.isLoaded = false;
		this.loadingPromise = this.load();
		this.loadingPromise.then(() => this.isLoaded = true);
	}

	private async load(): Promise<undefined | Event | string> {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.onload = () => {
				console.log(`plugin ${this.name} loaded`);
				resolve(undefined);
			};
			script.onerror = (e) => {
				console.error(`plugin${this.name} failed to load`, e);
				reject(e);
			};
			script.type = 'text/javascript';
			script.src = this.entry;
			document.head.appendChild(script);
		});
	}

	async initialize(): Promise<any> {
		if (this.orchestrator === undefined) {
			console.error(`Plugin "${this.name}" initialize called without an orchestration`);
		} else {
			this.orchestrator.initialize(this.pluginFunctions);
		}
	}

	deinitialize(): void {
		for (let i = 0; i < this.subscriptions.length; i++) {
			const [event, listener] = this.subscriptions[i];
			// @ts-ignore
			offEvent(event, listener);
		}
	}

	set orchestration(orchestration: App.PluginOrchestration) {
		this.orchestrator = orchestration;
	}
}

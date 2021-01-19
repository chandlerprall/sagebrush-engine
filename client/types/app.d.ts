/// <reference types="react" />
declare module "Plugin" {
    export default class Plugin {
        private name;
        private entry;
        private orchestrator?;
        isLoaded: boolean;
        loadingPromise: Promise<undefined | Event | string>;
        constructor(definition: App.PluginDefinition);
        private load;
        initialize(): Promise<any>;
        set orchestration(orchestration: App.PluginOrchestration);
    }
}
declare module "LoadingScreen" {
    export default function LoadingScreen(): JSX.Element;
}
declare module "state" {
    import Store from 'insula';
    import { ComponentType } from 'react';
    global {
        namespace App {
            interface State {
                app: {
                    currentScreen: ComponentType;
                };
                ui: {
                    screens: {
                        [key: string]: ComponentType;
                    };
                };
            }
            interface Events {
            }
        }
    }
    export const store: Store<App.State>;
    type primitive = string | number | boolean | undefined | null;
    class Undefined<T> {
        private t;
        constructor(t: T);
    }
    type RequiredKeys<T> = {
        [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
    }[keyof T];
    type Accessor<Shape, ForceOptional = false> = {
        [key in keyof Shape]-?: Shape[key] extends primitive ? key extends RequiredKeys<Shape> ? ForceOptional extends false ? Shape[key] : Shape[key] | undefined : Undefined<Shape[key]> : key extends RequiredKeys<Shape> ? Accessor<Shape[key], ForceOptional> : Accessor<Shape[key], true>;
    };
    type TypeFromAccessor<T> = T extends primitive ? T : T extends Undefined<infer U> ? U : T extends Accessor<infer Shape, infer ForceOptional> ? ForceOptional extends true ? Shape | undefined : Shape : never;
    export function useResource<T>(accessor: T): TypeFromAccessor<T>;
    export function getResource<T>(accessor: T): TypeFromAccessor<T>;
    export function setResource<T>(accessor: T, value: TypeFromAccessor<T>): void;
    type EventFunctions = Parameters<Parameters<typeof store['on']>[1]>[1];
    export function onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event], fns: EventFunctions) => void): void;
    export function offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
    export function dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
    export const state: Accessor<App.State, false>;
}
declare module "socket" {
    import { ReactNode, ReactElement } from 'react';
    global {
        namespace App {
            namespace Messages {
                interface FromClient {
                    DISCOVER_PLUGINS: {};
                }
                interface FromServer {
                    DISCOVER_PLUGINS_RESULT: {
                        plugins: PluginDefinition[];
                    };
                }
            }
        }
    }
    export function onMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void): void;
    export function offMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void): void;
    export function messageServer<Message extends keyof App.Messages.FromClient>(type: Message, payload: App.Messages.FromClient[Message]): void;
    export default function Socket({ children }: {
        children: ReactNode;
    }): ReactElement;
}
declare module "plugins" {
    import Plugin from "Plugin";
    global {
        namespace App {
            interface PluginDefinition {
                name: string;
                version: string;
                description: string;
                entry: string;
            }
            interface PluginOrchestration {
                initialize(): void | Promise<void>;
                deinitialize(): void;
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
    global {
        interface Window {
            registerPlugin(name: string, orchestration: App.PluginOrchestration): void;
        }
    }
}
declare module "App" {
    import "plugins";
    export default function App(): JSX.Element;
}
declare module "index" { }

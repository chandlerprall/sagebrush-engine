/// <reference types="react" />
declare module "Log" {
    export const LOG_LEVEL_ERROR = 0;
    export const LOG_LEVEL_WARN = 1;
    export const LOG_LEVEL_INFO = 2;
    export const LOG_LEVEL_DEBUG = 3;
    export type LOG_LEVEL = typeof LOG_LEVEL_ERROR | typeof LOG_LEVEL_WARN | typeof LOG_LEVEL_INFO | typeof LOG_LEVEL_DEBUG;
    export type LOG_LEVEL_STRING = 'error' | 'warn' | 'info' | 'debug';
    export const loggers: Log[];
    export default class Log {
        private name;
        private _level;
        enabled: boolean;
        constructor(name: string);
        set level(level: LOG_LEVEL_STRING);
        log(level: LOG_LEVEL_STRING, message: any): void;
        error(message: any): void;
        warn(message: any): void;
        info(message: any): void;
        debug(message: any): void;
    }
}
declare module "LoadingScreen" {
    export default function LoadingScreen(): JSX.Element;
}
declare module "MainScreen" {
    export default function MainScreen(): JSX.Element;
}
declare module "state" {
    import Store from 'insula';
    import { ComponentType } from 'react';
    global {
        namespace App {
            interface State {
                app: {
                    currentScreen: Accessor<ComponentType>;
                };
                ui: {
                    screens: {
                        loading: ComponentType;
                        main: ComponentType;
                    };
                };
            }
            interface Events {
                FINISHED_LOADING_PLUGINS: null;
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
    export type Accessor<Shape, ForceOptional = false> = {
        [key in keyof Shape]-?: Shape[key] extends primitive ? key extends RequiredKeys<Shape> ? ForceOptional extends false ? Shape[key] : Shape[key] | undefined : Undefined<Shape[key]> : Shape[key] extends Array<infer Members> ? ForceOptional extends false ? Array<Members> : Array<Members> | undefined : key extends RequiredKeys<Shape> ? Accessor<Shape[key], ForceOptional> : Accessor<Shape[key], true>;
    };
    type TypeFromAccessor<T> = T extends primitive ? T : T extends Array<any> ? T : T extends Undefined<infer U> ? U : T extends Accessor<infer Shape, infer ForceOptional> ? Shape extends Accessor<infer SubShape> ? ForceOptional extends true ? SubShape | undefined : SubShape : ForceOptional extends true ? Shape | undefined : Shape : never;
    type SetTypeFromAccessor<T> = T extends primitive ? T : T extends Array<any> ? T : T extends Undefined<infer U> ? U : T extends Accessor<infer Shape, infer ForceOptional> ? ForceOptional extends true ? Shape | undefined : Shape : never;
    export function useResource<T>(accessor: T): TypeFromAccessor<T>;
    export function getResource<T>(accessor: T): TypeFromAccessor<T>;
    export function setResource<T>(accessor: T, value: SetTypeFromAccessor<T>): void;
    type EventFunctions = Parameters<Parameters<typeof store['on']>[1]>[1];
    export function onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event], fns: EventFunctions) => void): void;
    export function offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
    export function dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
    export const state: Accessor<App.State, false>;
}
declare module "Plugin" {
    import { useResource, setResource, state } from "state";
    import Log from "Log";
    export interface PluginFunctions {
        state: typeof state;
        dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
        onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
        offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
        useResource: typeof useResource;
        setResource: typeof setResource;
        log: Log;
    }
    export default class Plugin {
        private name;
        description: string;
        version: string;
        entry: string;
        private log;
        private eventSubscriptions;
        initializer?: (args: PluginFunctions) => void | (() => void);
        private uninitializer?;
        private dispatchEvent;
        private onEvent;
        private offEvent;
        private pluginFunctions;
        isLoaded: boolean;
        loadingPromise: Promise<undefined | Event | string>;
        constructor(definition: App.PluginDefinition);
        load(): Promise<undefined | Event | string>;
        initialize(): Promise<any>;
        deinitialize(): void;
    }
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
                    RELOAD_PLUGIN: PluginDefinition;
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
    import Plugin, { PluginFunctions } from "Plugin";
    global {
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
    global {
        interface Window {
            registerPlugin(name: string, initializer: (arg: PluginFunctions) => void | (() => void)): void;
        }
    }
}
declare module "App" {
    import "plugins";
    export default function App(): JSX.Element;
}
declare module "index" { }

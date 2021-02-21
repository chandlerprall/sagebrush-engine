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
    import Plugin from "Plugin";
    type Saves = Array<{
        id: string;
        meta: any;
    }>;
    interface AppShape {
        isLoadingSave: boolean;
        currentScreen: Accessor<ComponentType>;
        screens: {
            loading: ComponentType;
            main: ComponentType;
        };
        plugins: {
            discovered: App.PluginDefinition[];
            loaded: Plugin<string>[];
        };
        saves: Saves;
    }
    global {
        namespace App {
            interface Plugins {
            }
            interface Events {
                FINISHED_LOADING_PLUGINS: null;
            }
        }
    }
    export const store: Store<AppShape>;
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
    export function makeAccessor<Shape extends object>(store: Store<Shape>, path?: string[]): Accessor<Shape>;
    export function useResource<T>(accessor: T): TypeFromAccessor<T>;
    export function getResource<T>(accessor: T): TypeFromAccessor<T>;
    export function setResource<T>(accessor: T, value: SetTypeFromAccessor<T>): void;
    type EventFunctions = Parameters<Parameters<typeof store['on']>[1]>[1];
    export function onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event], fns: EventFunctions) => void): void;
    export function offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
    export function dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
    export const state: Accessor<AppShape, false>;
}
declare module "socket" {
    import { ReactNode, ReactElement } from 'react';
    import { SaveableData } from "Plugin";
    global {
        namespace App {
            namespace Messages {
                interface FromClient {
                    DISCOVER_PLUGINS: null;
                    EXIT: null;
                    SAVE: {
                        id: string;
                        meta: SaveableData;
                        data: SaveableData;
                    };
                    GET_SAVES: null;
                    LOAD_SAVE: {
                        id: string;
                    };
                    DELETE_SAVE: {
                        id: string;
                    };
                    SAVE_CONFIG: SaveableData;
                    LOAD_CONFIG: null;
                }
                interface FromServer {
                    DISCOVER_PLUGINS_RESULT: {
                        plugins: PluginDefinition[];
                    };
                    RELOAD_PLUGIN: PluginDefinition;
                    GET_SAVES_RESULT: {
                        saves: Array<{
                            id: string;
                            meta: any;
                        }>;
                    };
                    LOAD_SAVE_RESULT: {
                        id: string;
                        data: {
                            [key: string]: SaveableData;
                        };
                    };
                    LOAD_CONFIG_RESULT: {
                        data: {
                            [key: string]: SaveableData;
                        };
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
    import { Accessor } from "state";
    import Plugin, { PluginFunctions, SaveableData } from "Plugin";
    global {
        namespace App {
            interface PluginDefinition {
                name: string;
                version: string;
                description: string;
                entry: string;
            }
            interface Events {
                LOAD_PLUGINS: null;
                PLUGIN_LOADED: Plugin<string>;
                INITIALIZE_PLUGINS: null;
            }
        }
    }
    global {
        interface Window {
            registerPlugin<PluginName extends string>(name: PluginName, initializer: (arg: PluginFunctions<PluginName>) => void | (() => void)): void;
        }
    }
    export function getPlugin<PluginName extends string>(pluginName: PluginName): Accessor<App.Plugins[PluginName]>;
    export function collectPluginSaveData(): {
        [key: string]: SaveableData;
    };
    export function setPluginSaveData(data: {
        [key: string]: SaveableData;
    }): void;
    export function collectPluginConfigData(): {
        [key: string]: SaveableData;
    };
    export function setPluginConfigData(data: {
        [key: string]: SaveableData;
    }): void;
}
declare module "Plugin" {
    import { getResource, useResource, setResource, state, Accessor } from "state";
    import Log from "Log";
    export type SaveableData = Object | Array<any>;
    global {
        namespace App {
            interface Plugins {
                [key: string]: Object;
            }
        }
    }
    export interface PluginFunctions<PluginName extends string> {
        getPlugin: <PluginName extends string>(pluginName: PluginName) => Accessor<App.Plugins[PluginName]>;
        app: typeof state;
        store: Accessor<App.Plugins[PluginName]>;
        dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]): void;
        onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
        offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void): void;
        useResource: typeof useResource;
        getResource: typeof getResource;
        setResource: typeof setResource;
        onGetSaveData: (fn: () => SaveableData) => void;
        onFromSaveData: (fn: (data: SaveableData) => void) => void;
        onGetConfigData: (fn: () => SaveableData) => void;
        onFromConfigData: (fn: (data: SaveableData) => void) => void;
        log: Log;
    }
    export default class Plugin<PluginName extends string> {
        name: PluginName;
        description: string;
        version: string;
        entry: string;
        getSaveData: (() => SaveableData) | undefined;
        fromSaveData: ((data: SaveableData) => void) | undefined;
        getConfigData: (() => SaveableData) | undefined;
        fromConfigData: ((data: SaveableData) => void) | undefined;
        private log;
        private eventSubscriptions;
        private store;
        accessor: Accessor<App.Plugins[PluginName]>;
        initializer?: (args: PluginFunctions<PluginName>) => void | (() => void);
        private uninitializer?;
        private dispatchEvent;
        private onEvent;
        private offEvent;
        private pluginFunctions;
        isLoaded: boolean;
        loadingPromise: Promise<undefined | Event | string>;
        constructor(definition: App.PluginDefinition);
        private setOnGetSaveData;
        private setOnFromSaveData;
        private setOnGetConfigData;
        private setOnFromConfigData;
        load(): Promise<undefined | Event | string>;
        initialize(): Promise<any>;
        deinitialize(): void;
    }
}
declare module "events" {
    import { SaveableData } from "Plugin";
    global {
        namespace App {
            interface Events {
                'APP.EXIT': null;
                'APP.SAVE': {
                    id: string;
                    meta: SaveableData;
                };
                'APP.GET_SAVES': null;
                'APP.LOAD_SAVE': {
                    id: string;
                };
                'APP.DELETE_SAVE': {
                    id: string;
                };
                'APP.SAVE_CONFIG': null;
                'APP.LOAD_CONFIG': null;
            }
        }
    }
}
declare module "App" {
    import "plugins";
    export default function App(): JSX.Element;
}
declare module "index" {
    import * as EmotionReactJsxRuntime from '@emotion/react/jsx-runtime';
    import "events";
    global {
        interface Window {
            EmotionReactJsxRuntime: typeof EmotionReactJsxRuntime;
        }
    }
}

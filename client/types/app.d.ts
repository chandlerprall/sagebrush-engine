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
    import { ComponentType, ReactNode } from 'react';
    import Plugin from "Plugin";
    type Saves = Array<{
        id: string;
        meta: any;
    }>;
    interface AppShape {
        isLoadingSave: boolean;
        loadingError?: string;
        currentScreen: ComponentType;
        globalNode?: ReactNode;
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
                app: AppShape;
            }
        }
    }
    export const storeKeyMap: WeakMap<Store<unknown>, string>;
    export const appStore: Store<AppShape>;
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
    type HandleOptionality<T, ForceOptional> = ForceOptional extends true ? T | undefined : T;
    type TypeFromAccessor<T> = T extends primitive ? T : T extends Array<any> ? T : T extends Undefined<infer U> ? U : T extends Accessor<infer Shape, infer ForceOptional> ? Shape extends Accessor<infer SubShape> ? SubShape extends unknown ? HandleOptionality<Shape, ForceOptional> : HandleOptionality<SubShape, ForceOptional> : HandleOptionality<Shape, ForceOptional> : never;
    export type Eventable<Events> = {
        dispatchEvent: <Event extends keyof Events>(event: Event, payload: Events[Event]) => void;
        onEvent: <Event extends keyof Events>(event: Event, listener: (payload: Events[Event]) => void) => void;
        onceEvent: <Event extends keyof Events>(event: Event, listener: (payload: Events[Event]) => void) => void;
        offEvent: <Event extends keyof Events>(event: Event, listener: (payload: Events[Event]) => void) => void;
    };
    export function makeAccessor<Shape, Events>(store: Store<Shape>, path?: string[]): Accessor<Shape> & Eventable<Events>;
    export function useResource<T>(accessor: T): TypeFromAccessor<T>;
    export function getResource<T>(accessor: T): TypeFromAccessor<T>;
    export function subscribeToResource<T>(accessor: T, listener: (value: [TypeFromAccessor<T>]) => void, callImmediately?: boolean): () => void;
    export function setResource<T>(accessor: T, value: TypeFromAccessor<T> | T): void;
    export const app: Accessor<AppShape, false> & Eventable<{
        EXIT: null;
        SAVE: {
            id: string;
            meta: any;
        };
        GET_SAVES: null;
        LOAD_SAVE: {
            id: string;
        };
        DELETE_SAVE: {
            id: string;
        };
        SAVE_CONFIG: null;
        LOAD_CONFIG: null;
        LOAD_PLUGINS: null;
        PLUGIN_LOADED: Plugin<string>;
        INITIALIZE_PLUGINS: null;
    }>;
}
declare module "socket" {
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
}
declare module "plugins" {
    import { Accessor, Eventable } from "state";
    import { PluginFunctions, SaveableData } from "Plugin";
    global {
        namespace App {
            interface PluginDefinition {
                name: string;
                version: string;
                description: string;
                entry: string;
            }
        }
    }
    export const registerPlugin: <PluginName extends string>(name: PluginName, initializer: (arg: PluginFunctions<PluginName>) => void | (() => void) | Promise<void> | Promise<() => void>) => void | Promise<void>;
    export function getPlugin<PluginName extends string, ReturnType = Accessor<App.Plugins[PluginName]> & Eventable<App.Events[PluginName]>>(pluginName: PluginName): ReturnType;
    export function collectPluginSaveData(): {
        [key: string]: any;
    };
    export function setPluginSaveData(data: {
        [key: string]: SaveableData;
    }): void;
    export function collectPluginConfigData(): {
        [key: string]: any;
    };
    export function setPluginConfigData(data: {
        [key: string]: SaveableData;
    }): void;
}
declare module "Plugin" {
    import { getResource, useResource, setResource, subscribeToResource, app, Accessor, Eventable } from "state";
    import Log from "Log";
    export type SaveableData = any;
    global {
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
        useResource: typeof useResource;
        getResource: typeof getResource;
        setResource: typeof setResource;
        subscribeToResource: typeof subscribeToResource;
        onGetSaveData: (fn: () => SaveableData) => void;
        onFromSaveData: (fn: (data: SaveableData) => void) => void;
        onGetConfigData: (fn: () => SaveableData) => void;
        onFromConfigData: (fn: (data: SaveableData) => void) => void;
        log: Log;
        devData: any;
        onDevReload: (fn: () => any) => void;
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
        private getDevData;
        private devData;
        private log;
        private eventSubscriptions;
        private resourceSubscriptions;
        private store;
        accessor: Accessor<App.Plugins[PluginName]> & Eventable<App.Events[PluginName]>;
        initializer?: (args: PluginFunctions<PluginName>) => void | (() => void);
        private uninitializer?;
        isLoaded: boolean;
        loadingPromise: Promise<undefined | Event | string>;
        constructor(definition: App.PluginDefinition);
        private getPlugin;
        private setOnGetSaveData;
        private setOnFromSaveData;
        private setOnGetConfigData;
        private setOnFromConfigData;
        private subscribeToResource;
        private setOnDevReload;
        load(): Promise<undefined | Event | string>;
        initialize(): Promise<any>;
        deinitialize(): void;
    }
}
declare module "events" {
    import Plugin, { SaveableData } from "Plugin";
    global {
        namespace App {
            interface Events {
                app: {
                    EXIT: null;
                    SAVE: {
                        id: string;
                        meta: SaveableData;
                    };
                    GET_SAVES: null;
                    LOAD_SAVE: {
                        id: string;
                    };
                    DELETE_SAVE: {
                        id: string;
                    };
                    SAVE_CONFIG: null;
                    LOAD_CONFIG: null;
                    LOAD_PLUGINS: null;
                    PLUGIN_LOADED: Plugin<string>;
                    INITIALIZE_PLUGINS: null;
                };
            }
        }
    }
}
declare module "socket.web" {
    export function onMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void): void;
    export function offMessage<Message extends keyof App.Messages.FromServer>(message: Message, listener: (payload: App.Messages.FromServer[Message]) => void): void;
    export function messageServer<Message extends keyof App.Messages.FromClient>(type: Message, payload: App.Messages.FromClient[Message]): Promise<void>;
}
declare module "App" {
    import "plugins";
    export default function App(): JSX.Element;
}
declare module "index" {
    import * as EmotionReact from '@emotion/react';
    import * as EmotionReactJsxRuntime from '@emotion/react/jsx-runtime';
    import "events";
    import { getPlugin, registerPlugin } from "plugins";
    global {
        interface Window {
            EmotionReact: typeof EmotionReact;
            EmotionReactJsxRuntime: typeof EmotionReactJsxRuntime;
            SagebrushEngineClient: {
                getPlugin: typeof getPlugin;
                registerPlugin: typeof registerPlugin;
            };
        }
    }
}

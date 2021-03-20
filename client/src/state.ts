import Store from 'insula';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';
import MainScreen from './MainScreen';
import Plugin from './Plugin';

type Saves = Array<{ id: string, meta: any }>

interface AppShape {
	isLoadingSave: boolean;
	currentScreen: ComponentType;

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

declare global {
	namespace App {
		interface Plugins {
			app: AppShape;
		}
	}
}

export const storeKeyMap = new WeakMap<Store<unknown>, string>();

export const appStore = new Store<AppShape>({
	isLoadingSave: false,
	currentScreen: undefined as any, // fulfilled after `state` accessor is created below

	screens: {
		loading: LoadingScreen,
		main: MainScreen,
	},

	plugins: {
		discovered: [],
		loaded: [],
	},

	saves: [],
});
storeKeyMap.set(appStore, 'app');

type primitive = string | number | boolean | undefined | null;

class Undefined<T>{
	// @ts-ignore
  constructor(private t: T){}
}

type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type Accessor<Shape, ForceOptional = false> = {
  [key in keyof Shape]-?:
    Shape[key] extends primitive
      ? key extends RequiredKeys<Shape>
        // required
        ? ForceOptional extends false
          ? Shape[key]
          : Shape[key] | undefined
        // optional
        // Any `undefined` added here would be removed if --strictNullChecks mode is enabled
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
        // >> Note that in --strictNullChecks mode, when a homomorphic mapped type removes a ? modifier from a property in the underlying type it also removes undefined from the type of that property:
        // instead, we can return a private class and convert it back to
        // `undefined` when the time comes to interpret the output type
        : Undefined<Shape[key]> // note there is no `| undefined` here, as the type already includes it from being optional
			: Shape[key] extends Array<infer Members>
				? ForceOptional extends false
					? Array<Members>
					: Array<Members> | undefined
				: key extends RequiredKeys<Shape>
					? Accessor<Shape[key], ForceOptional> // required
					: Accessor<Shape[key], true> // optional
};

type TypeFromAccessor<T> = T extends primitive
  ? T
	: T extends Array<any>
		? T
		: T extends Undefined<infer U>
			? U
			: T extends Accessor<infer Shape, infer ForceOptional>
				? Shape extends Accessor<infer SubShape>
					? ForceOptional extends true
						? SubShape | undefined
						: SubShape
					: ForceOptional extends true
							? Shape | undefined
							: Shape
				: never
;

export type Eventable<Events> = {
	dispatchEvent: <Event extends keyof Events>(event: Event, payload: Events[Event]) => void;
	onEvent: <Event extends keyof Events>(event: Event, listener: (payload: Events[Event]) => void) => void;
	offEvent: <Event extends keyof Events>(event: Event, listener: (payload: Events[Event]) => void) => void;
};

export function makeAccessor<Shape, Events>(store: Store<Shape>, path: string[] = []): Accessor<Shape> & Eventable<Events> {
	function dispatchEvent(event: string, payload: any) {
		store.dispatch(event, payload);
	}
	function onEvent(event: string, listener: (payload: any) => void) {
		return store.on(event, listener);
	}
	function offEvent(event: string, listener: (payload: any) => void) {
		store.off(event, listener);
	}
	return new Proxy(
		{},
		{
			get(_target, prop: string) {
				if (prop === '__store') return store;
				if (prop === '__path') return path;
				if (prop === 'dispatchEvent') return dispatchEvent;
				if (prop === 'onEvent') return onEvent;
				if (prop === 'offEvent') return offEvent;
				return makeAccessor(store, [...path, prop]);
			}
		}
	) as any;
}

function resolvePossiblePointer<T>(accessor: T): Array<{ store: Store<unknown>, selector: string[] }> {
	let store: Store<unknown> = (accessor as any).__store;
	let selector: string[] = (accessor as any).__path;

	const pointers: Array<{ store: Store<unknown>, selector: string[] }> = [{ store, selector }];

	while (true) {
		const _value = store.getPartialState(selector);
		if (_value != null && typeof _value === 'object') {
			if (_value.__store && _value.__path) {
				accessor = _value;
				store = (accessor as any).__store;
				selector = (accessor as any).__path;
				pointers.push({ store, selector });
			} else {
				break;
			}
		} else {
			break;
		}
	}

	pointers.reverse();
	return pointers;
}

// React will throw away a setState operation if the same object/array is passed
// so clone objects/arrays when alerted that they have changed
function makeUnused(value: any) {
	if (Array.isArray(value)) return [...value];
	if (value != null && typeof value === 'object')  return {...value};
	return value;
}

function makeKeyFromResources(resources: Array<{ store: Store<unknown>, selector: string[] }>): string {
	let key = '';
	for (let i = 0; i < resources.length; i++) {
		const { store, selector } = resources[i];
		key += `:${storeKeyMap.get(store)}.${selector.join('.')}`;
	}
	return key;
}

export function useResource<T>(accessor: T): TypeFromAccessor<T> {
	const resources = resolvePossiblePointer(accessor);
	const [value, _setValue] = useState(() => resources[0].store.getPartialState(resources[0].selector));
	const setValue = useCallback(value => _setValue(() => makeUnused(value)), []);

	const [key, setKey] = useState(() => makeKeyFromResources(resources));

	useEffect(() => {
		// it's possible for a value to have changed between the initial render and this useEffect firing
		const currentValue = resources[0].store.getPartialState(resources[0].selector);
		setValue(currentValue);

		const subscriptions: Array<() => void> = [];

		for (let i = 0; i < resources.length; i++) {
			const { store, selector } = resources[i];
			const subscription = store.subscribeToState(
				[selector],
				i === 0
				? ([value]) => {
						setValue(value);
					}
				: () => {
						setKey(makeKeyFromResources(resolvePossiblePointer(accessor)));
					}
			);
			subscriptions.push(subscription);
		}

		return () => {
			for (let i = 0; i < subscriptions.length; i++) {
				subscriptions[i]();
			}
		}
	}, [(accessor as any).__store, (accessor as any).__path.join('.'), key]);

	return value;
}

export function getResource<T>(accessor: T): TypeFromAccessor<T> {
	const resolved = resolvePossiblePointer(accessor);
	const { store, selector } = resolved[0];
	return store.getPartialState(selector);
}

export function setResource<T>(accessor: T, value: TypeFromAccessor<T> | T) {
	const store: Store<any> = (accessor as any).__store;
	const selector: string[] = (accessor as any).__path;
	store.setPartialState(selector, value);
}

export const app = makeAccessor<AppShape, App.Events['app']>(appStore);
setResource(app.currentScreen, app.screens.loading);

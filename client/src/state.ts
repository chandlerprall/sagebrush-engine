import Store  from 'insula';
import { ComponentType, useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';
import MainScreen from './MainScreen';

declare global {
	namespace App {
		// general application state
		interface App {
			isLoadingSave: boolean;
			currentScreen: Accessor<ComponentType>;
		}

		// screens available
		interface UiScreens {
			loading: ComponentType;
			main: ComponentType;
		}

		// ui interfaces
		interface Ui {
			screens: UiScreens;
		}

		// customizable application state
		interface Data {}

		// array of save id & metadata
		type Saves = Array<{ id: string, meta: any }>

		interface State {
			app: App;
			ui: Ui;
			data: Data;
			saves: Saves;
		}

		interface Events {
			FINISHED_LOADING_PLUGINS: null;
		}
	}
}

export const store = new Store<App.State>({
	app: {
		isLoadingSave: false,
		currentScreen: undefined as any, // fulfilled after `state` accessor is created below
	},
	ui: {
		screens: {
			loading: LoadingScreen,
			main: MainScreen,
		},
	},
	data: {},
	plugins: {
		discovered: [],
		loaded: [],
	},
	saves: [],
});

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

type SetTypeFromAccessor<T> = T extends primitive
  ? T
	: T extends Array<any>
		? T
		: T extends Undefined<infer U>
			? U
			: T extends Accessor<infer Shape, infer ForceOptional>
				? ForceOptional extends true
					? Shape | undefined
					: Shape
				: never
;

function makeAccessor<Shape extends object>(store: Store<Shape>, path: string[] = []): Accessor<Shape> {
	return new Proxy(
		{},
		{
			get(_target, prop: string) {
				if (prop === '__store') return store;
				if (prop === '__path') return path;
				return makeAccessor(store, [...path, prop]);
			}
		}
	) as any;
}

function resolvePossiblePointer<T>(accessor: T): string[] {
	const store: Store<App.State> = (accessor as any).__store;
	let selector: string[] = (accessor as any).__path;

	const _value = store.getPartialState(selector);
	if (_value != null && typeof _value === 'object') {
		if (_value.__store && _value.__path) {
			accessor = _value;
			selector = (accessor as any).__path;
		}
	}

	return selector;
}

// React will throw away a setState operation if the same object/array is passed
// so clone objects/arrays when alerted that they have changed
function makeUnused(value: any) {
	if (Array.isArray(value)) return [...value];
	if (value != null && typeof value === 'object')  return {...value};
	return value;
}

export function useResource<T>(accessor: T): TypeFromAccessor<T> {
	const store: Store<App.State> = (accessor as any).__store;
	const rawSelector: string[] = (accessor as any).__path;
	const [resolvedSelector, setResolvedSelector] = useState(() => resolvePossiblePointer(accessor));

	const [value, setValue] = useState(() => store.getPartialState(resolvedSelector));

	useEffect(() => {
		// it's possible for a value to have changed between the initial render and this useEffect firing
		const currentValue = store.getPartialState(resolvedSelector);
		setValue(() => makeUnused(currentValue));

		const subscriptions: Function[] = [];

		if (rawSelector.join() === resolvedSelector.join()) {
			subscriptions.push(store.subscribeToState([rawSelector], ([value]) => {
				setValue(() => makeUnused(value));
			}));
		} else {
			// watch pointer
			subscriptions.push(
				store.subscribeToState([rawSelector], ([accessor]) => {
					setResolvedSelector((accessor as any).__path);
				}),
				store.subscribeToState([resolvedSelector], ([value]) => {
					setValue(() => value);
				})
			);
		}

		return () => {
			for (let i = 0; i < subscriptions.length; i++) {
				subscriptions[i]();
			}
		}
	}, [rawSelector.join(), resolvedSelector.join()]);

	return value;
}

export function getResource<T>(accessor: T): TypeFromAccessor<T> {
	const store: Store<App.State> = (accessor as any).__store;
	const selector: string[] = (accessor as any).__path;
	return store.getPartialState(selector);
}

export function setResource<T>(accessor: T, value: SetTypeFromAccessor<T>) {
	const store: Store<App.State> = (accessor as any).__store;
	const selector: string[] = (accessor as any).__path;
	store.setPartialState(selector, value);
}

type EventFunctions = Parameters<Parameters<typeof store['on']>[1]>[1];

export function onEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event], fns: EventFunctions) => void) {
	store.on(event, listener);
}

export function offEvent<Event extends keyof App.Events>(event: Event, listener: (payload: App.Events[Event]) => void) {
	store.off(event, listener);
}

export function dispatchEvent<Event extends keyof App.Events>(event: Event, payload: App.Events[Event]) {
	store.dispatch(event, payload);
}

export const state = makeAccessor(store);
setResource(state.app.currentScreen, state.ui.screens.loading);

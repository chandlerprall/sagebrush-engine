import Store  from 'insula';
import { ComponentType, useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';

declare global {
	namespace State {
		interface Shape {
			app: {
				currentScreen: ComponentType;
			}
			ui: {
				screens: { [key: string]: ComponentType }
			};
		}
	}
}

const store = new Store<State.Shape>({
	app: {
		currentScreen: LoadingScreen,
	},
	ui: {
		screens: {
			loading: LoadingScreen,
		},
	},
});

type primitive = string | number | boolean | undefined | null;

class Undefined<T>{
	// @ts-ignore
  constructor(private t: T){}
}

type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
type Accessor<Shape, ForceOptional = false> = {
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
      : key extends RequiredKeys<Shape>
        ? Accessor<Shape[key], ForceOptional> // required
        : Accessor<Shape[key], true> // optional
};

type TypeFromAccessor<T> = T extends primitive
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

export function useResource<T>(accessor: T): TypeFromAccessor<T> {
	const store: Store<State.Shape> = (accessor as any).__store;
	const path: string[] = (accessor as any).__path;
	const selector = path.slice();

	const [value, setValue] = useState(() => store.getPartialState(selector));

	useEffect(() => {
		// it's possible for a value to have changed between the initial render and this useEffect firing
		const currentValue = store.getPartialState(selector);
		if (currentValue !== value) setValue(() => currentValue);

		return store.subscribeToState([selector], ([value]) => {
			setValue(() => value);
		});
	}, []);

	return value;
}

export const state = makeAccessor(store);

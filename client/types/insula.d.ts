declare module 'insula' {
	export default class Store<Shape> {
		constructor(data: Shape);

		getState(): Shape;
		setState(state: Shape): void;
		getPartialState(selector: string[]): any;
		setPartialState(selector: string[], value: any): void;
		subscribeToState(selectors: Array<string[]>, subscriber: (values: any[]) => void): () => void;

		dispatch(event: string, payload: any): void;
		on(event: string, callback: (payload: any, fns: { dispatch: Store<Shape>['dispatch'], getState: Store<Shape>['getState'], getPartialState: Store<Shape>['getPartialState'], setState: Store<Shape>['setState'], setPartialState: Store<Shape>['setPartialState'] }) => void): void;
		off(event: string, callback: (payload: any, fns: { dispatch: Store<Shape>['dispatch'], getState: Store<Shape>['getState'], getPartialState: Store<Shape>['getPartialState'], setState: Store<Shape>['setState'], setPartialState: Store<Shape>['setPartialState'] }) => void): void;
	}
}

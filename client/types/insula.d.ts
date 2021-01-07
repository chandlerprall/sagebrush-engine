declare module 'insula' {
	export default class Store<Shape> {
		constructor(data: Shape);

		getState(): Shape;
		getPartialState(selector: string[]): any;
		setPartialState(selector: string[], value: any): void;
		subscribeToState(selectors: Array<string[]>, subscriber: (values: any[]) => void): () => void;
	}
}

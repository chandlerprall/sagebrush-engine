import React from 'react';
import ReactDOM from 'react-dom';
import * as EmotionReactJsxRuntime from '@emotion/react/jsx-runtime';
import App from './App';

declare global {
	interface Window {
		EmotionReactJsxRuntime: typeof EmotionReactJsxRuntime;
	}
}

window.React = React;
window.ReactDOM = ReactDOM;
window.EmotionReactJsxRuntime = EmotionReactJsxRuntime;

ReactDOM.render(
	<App />,
	document.getElementById('app')
);

import React from 'react';
import ReactDOM from 'react-dom';
import * as EmotionReact from '@emotion/react';
import * as EmotionReactJsxRuntime from '@emotion/react/jsx-runtime';
import App from './App';
import './events';
import {getPlugin, registerPlugin} from './plugins';

declare global {
	interface Window {
		EmotionReact: typeof EmotionReact;
		EmotionReactJsxRuntime: typeof EmotionReactJsxRuntime;
		SagebrushEngineClient: {
			getPlugin: typeof getPlugin,
			registerPlugin: typeof registerPlugin,
		}
	}
}

window.React = React;
window.ReactDOM = ReactDOM;
window.EmotionReact = EmotionReact;
window.EmotionReactJsxRuntime = EmotionReactJsxRuntime;
window.SagebrushEngineClient = { getPlugin, registerPlugin };

ReactDOM.render(
	<App />,
	document.getElementById('app')
);

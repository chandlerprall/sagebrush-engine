/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="@sagebrush/engine-client/types/insula" />
/// <reference types="@sagebrush/engine-client/types/app" />

import { PluginFunctions } from 'Plugin';
import buttons from './menu_buttons';
import layout from './menu_layout';
import title from './menu_title';
import mainscreen from './MainScreen';

export default function menu(options: PluginFunctions<'ui'>) {
	return {
		screen: mainscreen(options),
		buttons: buttons(options),
		layout: layout(options),
		title: title(),
	};
}

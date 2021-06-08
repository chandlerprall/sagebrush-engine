/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="@sagebrush/engine-client/types/insula" />
/// <reference types="@sagebrush/engine-client/types/app" />

export default function styles(): App.Plugins['ui']['styles'] {
	return {
		primary: '#d7d7d7',

		success: '#58c356',
		danger: '#f33a3a',
		warning: '#ffc945',

		border: '1px solid #000',
		focusOutline: '1px solid #88f',
	};
}

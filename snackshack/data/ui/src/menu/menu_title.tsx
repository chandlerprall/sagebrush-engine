import React from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';

export default ({ useResource, plugin }: PluginFunctions<'ui'>) => () => (
	<h1 css={css`
		position: absolute;
		font-size: 24px;
		top: 25px;
		left: 50%;
		transform: translateX(-50%);
	`}>{useResource(plugin.menu.titleText)}</h1>
);

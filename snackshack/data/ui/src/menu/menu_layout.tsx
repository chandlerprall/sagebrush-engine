import React from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';

export default ({ getResource, plugin }: PluginFunctions<'ui'>) => () => {
	const buttons = getResource(plugin.menu.buttons);
	const Button = getResource(plugin.button);

	return (
		<div css={css`
		position: absolute;
		bottom: 50px;
		left: 50%;
		transform: translateX(-50%);
	`}>
			{
				buttons.map((button, idx) => (
					<Button key={idx} {...button} />
				))
			}
		</div>
	);
};

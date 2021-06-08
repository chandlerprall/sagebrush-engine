import React, { Fragment } from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';

export default ({ useResource, plugin }: PluginFunctions<'ui'>) => () => {
	const buttons = useResource(plugin.menu.buttons);
	const Button = useResource(plugin.button);

	const buttonIds = Object.keys(buttons);
	return (
		<div css={css`
			position: absolute;
			top: 25%;
			left: 50%;
			transform: translateX(-50%);
			text-align: center;
		`}>
			{
				buttonIds.map(id => (
					<Fragment key={id}>
						<Button {...buttons[id]} css={css`
							margin-bottom: 10px;
						`} />
						<br/>
					</Fragment>
				))
			}
		</div>
	);
};

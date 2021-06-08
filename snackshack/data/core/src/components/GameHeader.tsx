import React from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';

export default ({ useResource, plugin }: PluginFunctions<'core'>) => {
	return () => {
		const { name, money } = useResource(plugin.game)!;
		return (
			<header css={css`
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				background-color: #bbb;
			`}>
				{name}

				<span css={css`margin: 0 10px`}>
					${money.toFixed(2)}
				</span>
			</header>
		)
	}
}

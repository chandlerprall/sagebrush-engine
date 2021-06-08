import React, { ButtonHTMLAttributes, FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';
import chroma from 'chroma-js';

export default ({ useResource, plugin }: PluginFunctions<'ui'>) => {
	const Button: FunctionComponent<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
		const styles = useResource(plugin.styles);
		return (
			<button
				type="button"
				css={css`
				background-color: ${styles.primary};
				border: ${styles.border};
				padding: 5px 7px;
				cursor: pointer;
				font-size: 0.8rem;

				:hover {
					background-color: ${chroma(styles.primary).brighten(0.3).hex()};
				}
				:focus {
					outline: ${styles.focusOutline}
				}
				:active {
					transform: translateY(1px);
				}
			`}
				{...props}
			/>
		);
	};
	return Button;
}

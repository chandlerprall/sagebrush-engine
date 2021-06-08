import React, { forwardRef, useState } from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';
import chroma from 'chroma-js';

function generateId() {
	return Math.random().toString();
}

export default ({ useResource, plugin }: PluginFunctions<'ui'>) => {
	return forwardRef<HTMLInputElement, App.Plugins['ui']['input']>(({ label, ...props }, ref) => {
		const [id] = useState(generateId);
		const styles = useResource(plugin.styles);
		return (
			<div css={css`
				margin-bottom: 5px;
				label {
					display: block;
					margin-bottom: 2px;
					cursor: pointer;
				}

				input {
					display: inline-block;
					width: 100%;
				}
			`}>
				<label htmlFor={id}>{label}</label>
				<input
					id={id}
					ref={ref}
					css={css`
						box-sizing: border-box;
						padding: 5px 3px;
						background-color: ${styles.primary};
						border: ${styles.border};
						font-size: 0.8rem;

						:hover {
							background-color: ${chroma(styles.primary).brighten(0.3).hex()};
						}
						:focus {
							outline: ${styles.focusOutline}
						}
					`}
					{...props}
				/>
			</div>
		);
	});
};

import React from 'react';
import { css } from '@emotion/react';
import { ButtonProps } from './plugin';

export function Button({ children, size = 's', ...props }: ButtonProps) {
	const style = css`
		background-color: #e3eaea;
		border: 1px solid #333;
		cursor: pointer;
		font-size: ${size === 's' ? '14px' : '18px'};
		padding: ${size === 's' ? '3px 10px' : '5px 20px'};

		:hover, :focus {
			background-color: #e8f6f6;
			outline: 1px solid #4fb0de;
		}

		:active {
			background-color: #a8e3e3;
		}
	`;
	return (
		<button type="button" css={style} {...props}>
			{children}
		</button>
	);
}

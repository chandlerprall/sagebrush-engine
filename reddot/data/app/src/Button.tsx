import React, { Attributes, ButtonHTMLAttributes } from 'react';
import { css } from '@emotion/react';

export function Button({ children, size, ...props }: { css?: Attributes['css'], size?: 's' | 'l' } & ButtonHTMLAttributes<HTMLButtonElement>) {
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
	`;
	return (
		<button type="button" css={style} {...props}>
			{children}
		</button>
	);
}

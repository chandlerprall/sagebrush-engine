import React from 'react';
import { css } from '@emotion/react';

export default () => () => (
	<h1 css={css`
		position: absolute;
		font-size: 24px;
		top: 25px;
		left: 50%;
		transform: translateX(-50%);
	`}>Menu Title</h1>
);

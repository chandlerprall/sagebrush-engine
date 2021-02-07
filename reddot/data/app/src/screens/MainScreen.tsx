import React from 'react';
import { css } from '@emotion/react';
import { Button } from '../Button';

export default ({ dispatchEvent }: { dispatchEvent: Function }) => function MainScreen() {
	return (
		<>
			<h1 css={css`
					position: absolute;
					top: 75px;
					width: 100%;
					text-align: center;
					color: red;
					font-size: 28px;
					font-weight: bold;
					font-family: "Courier New";
				`}>
				Red Dot
			</h1>

			<div css={css`
					position: absolute;
					top: 175px;
					width: 100%;
					text-align: center;
				`}>
				<Button size="l" onClick={undefined}>Classic</Button>
				<br/><br/>
				<Button size="l" onClick={undefined}>Timed</Button>
				<br/><br/>
				<Button size="l" onClick={() => dispatchEvent('APP.EXIT', null)}>Quit</Button>
			</div>
		</>
	)
};

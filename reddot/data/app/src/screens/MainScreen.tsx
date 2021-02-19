import React, { useEffect } from 'react';
import { css } from '@emotion/react';
import { Button } from '../Button';
import { PluginFunctions } from 'Plugin';
import { formatSeconds } from './GameScreen';

export default ({ dispatchEvent, useResource, state }: PluginFunctions) => function MainScreen() {
	useEffect(() => {
		dispatchEvent('APP.GET_SAVES', null);
		dispatchEvent('APP.LOAD_CONFIG', null);
	}, []);

	const saves = useResource(state.saves);
	const save: undefined | { id: string, meta: App.Data['game'] } = saves[0];

	const highscore = useResource(state.data.config.highscore);

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
			{
				highscore != null && (
					<div css={css`
					position: absolute;
					top: 100px;
					width: 100%;
					text-align: center;
					font-weight: bold;
				`}>
						highscore: {highscore}
					</div>
				)
			}

			{
				save && (
					<div css={css`
					position: absolute;
					top: 150px;
					width: 100%;
					text-align: center;
				`}>
						{save.meta.gametype}
						{
							save.meta.gametype === 'timed' && (
								<>
									, {formatSeconds(save.meta.secondsRemaining)} remaining
								</>
							)
						}
						, score: {save.meta.score}
						<br/>
						<Button size="l" onClick={() => dispatchEvent('RESUME_GAME', null)}>Continue</Button>
					</div>
				)
			}

			<div css={css`
					position: absolute;
					top: 250px;
					width: 100%;
					text-align: center;
				`}>
				<Button size="l" onClick={() => dispatchEvent('START_GAME', { type: 'classic' })}>Classic</Button>
				<br/><br/>
				<Button size="l" onClick={() => dispatchEvent('START_GAME', { type: 'timed' })}>Timed</Button>
				<br/><br/>
				<Button size="l" onClick={() => dispatchEvent('APP.EXIT', null)}>Quit</Button>
			</div>
		</>
	)
};

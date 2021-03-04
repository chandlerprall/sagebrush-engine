import React, { useEffect } from 'react';
import { css, keyframes } from '@emotion/react';
import { PluginFunctions } from 'Plugin';
import { Button } from '../Button';

export function formatSeconds(seconds: number) {
	const remainingMinutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds - remainingMinutes * 60;
	return `${remainingMinutes > 0 ? `${remainingMinutes}:`: ''}${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
}

const explosion = keyframes`
from {
	transform: scale(1);
	opacity: 1;
}

to {
	transform: scale(5);
	opacity: 0;
}
`;

function Game({ setResource, useResource, app, plugin }: PluginFunctions<'reddot'>) {
	const { isGameOver, gametype, dot, score, secondsRemaining } = useResource(plugin.game);

	useEffect(() => {
		if (secondsRemaining === 0 && gametype === 'timed') {
			plugin.dispatchEvent('GAME_OVER', null);
		}
	}, [gametype, secondsRemaining]);

	const onMissClick = () => {
		plugin.dispatchEvent('GAME_OVER', null);
	}

	return (
		<div css={css`
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
		`} onClick={onMissClick}>
			<div css={css`
				position: absolute;
				top: 0;
				width: 100%;
				text-align: center;
				font-size: 24px;
				font-weight: bold;
			`}>
				{score}
			</div>

			<div key={score} css={css`
				position: absolute;
				top: 0;
				width: 100%;
				text-align: center;
				font-size: 24px;
				font-weight: bold;
				animation: ${explosion} 0.4s ease-out;
			`}>
				{score}
			</div>

			{
				gametype === 'timed' && (
					<div css={css`
						position: absolute;
						top: 30px;
						width: 100%;
						text-align: center;
						font-size: 14px;
					`}>
						{formatSeconds(secondsRemaining)}
					</div>
				)
			}

			<Button
				css={css`
					position: absolute;
					top: 5px;
					right: 5px;
				`}
				onClick={(e) => {
					e.stopPropagation();
					plugin.dispatchEvent('GOTO_MENU', null);
				}}
			>
				back
			</Button>

			<button tabIndex={-1} css={css`
				position: absolute;
				top: ${dot.top}px;
				left: ${dot.left}px;
				height: 12px;
				width: 12px;
				padding: 0;
				background-color: red;
				border-radius: 50px;
				cursor: pointer;
				border-width: 0;
				outline-width: 0;
				transform: translate(-50%, -50%);
			`}
			onClick={(e) => {
				e.stopPropagation();
				plugin.dispatchEvent('DOT_CLICKED', null)
			}}
			/>

			{
				isGameOver && (
					<>
						<div css={css`
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 100%;
							backdrop-filter: blur(3px);
						`}>
							<span css={css`
								position: absolute;
								color: red;
								font-size: 34px;
								top: 50%;
								left: 50%;
								transform: translate(-50%, -50%);
								text-shadow: 3px 3px 7px #88B;
							`}>Game Over</span>
						</div>
						<Button css={css`
								position: absolute;
								top: calc(50% + 50px);
								left: 50%;
								transform: translate(-50%, -50%);
							`}
							onClick={(e) => {
								e.stopPropagation();
								setResource(app.currentScreen, app.screens.main)
							}}
						>
							return to menu
						</Button>
					</>
				)
			}
		</div>
	);
}

export default (fns: PluginFunctions<'reddot'>) => function GameScreen() {
	const { useResource, app } = fns;
	const isLoadingSave = useResource(app.isLoadingSave);

	return isLoadingSave
		? <></>
		: <Game {...fns} />
	;
}

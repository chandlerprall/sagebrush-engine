import React, { useRef } from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';

export default ({ getPlugin, useResource, plugin }: PluginFunctions<'core'>) => {
	return () => {
		const ui = getPlugin('ui');
		const HeadedSection = useResource(ui.headedSection);
		const Input = useResource(ui.input);
		const Button = useResource(ui.button);

		const inputRef = useRef<HTMLInputElement>(null);

		return (
			<div css={css`
				position: absolute;
				top: 25px;
				left: 50%;
				transform: translateX(-50%);
				width: 250px;
			`}>
				<HeadedSection title="New game">
					<form onSubmit={() => plugin.dispatchEvent(
						'startGame',
						{ companyName: inputRef.current!.value }
					)}>
						<Input ref={inputRef} label="Company Name" />
						<Button
							type="submit"
							css={css`
								margin-top: 25px;
								position: absolute;
								right: 0;
							`}
						>
							Start Game
						</Button>
					</form>
				</HeadedSection>
			</div>
		);
	}
}

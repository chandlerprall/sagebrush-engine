import React, { ComponentType } from 'react';

declare global {
	namespace App {
		interface UiScreens {
			game: ComponentType
		}
	}
}

export default function GameScreen() {
	return (
		<div>
			GAME ON
		</div>
	)
}

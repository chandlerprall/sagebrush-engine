import React from 'react';
import { app } from './state';

export default function MainScreen() {
	return (
		<div>
			<h1>Main</h1>
			<button onClick={() => app.dispatchEvent('EXIT', null)}>Exit</button>
		</div>
	);
}

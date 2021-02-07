import React from 'react';
import { dispatchEvent } from './state';

export default function MainScreen() {
	return (
		<div>
			<h1>Main</h1>
			<button onClick={() => dispatchEvent('APP.EXIT', null)}>Exit</button>
		</div>
	);
}

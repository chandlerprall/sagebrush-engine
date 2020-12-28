import React from 'react';
import Socket from './socket';

export default function App() {
	return (
		<Socket>
			<div>This is my socketed app.</div>
		</Socket>
	);
}

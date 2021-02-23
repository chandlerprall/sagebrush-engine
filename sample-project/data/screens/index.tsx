import React from 'react';

window.registerPlugin('screens', function initPlugin({ log, app, setResource }) {
	log.enabled = true;
	log.level = 'debug';

	function MainScreen() {
		return (
			<div css={{ color: 'green' }}>
				Custom main screen
				<br/><br/>
				<button onClick={() => app.dispatchEvent('EXIT', null)}>Quit</button>
			</div>
		)
	}
	log.debug('setting main screen')
	setResource(app.screens.main, MainScreen);

	log.debug('initialized');

	return () => {
		log.debug('deinitialized');
	};
});

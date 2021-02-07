import React from 'react';

window.registerPlugin('screens', function initPlugin({ log, state, setResource, dispatchEvent }) {
	log.enabled = true;
	log.level = 'debug';

	function MainScreen() {
		return (
			<div css={{ color: 'green' }}>
				Custom main screen
				<br/><br/>
				<button onClick={() => dispatchEvent('APP.EXIT', null)}>Quit</button>
			</div>
		)
	}
	log.debug('setting main screen')
	setResource(state.ui.screens.main, MainScreen);

	log.debug('initialized');

	return () => {
		log.debug('deinitialized');
	};
});

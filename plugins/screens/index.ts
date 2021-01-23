window.registerPlugin('screens', function initPlugin({ log }) {
	// log.enabled = true;
	log.level = 'debug';

	log.debug('initialized');

	return () => {
		log.debug('deinitialized');
	};
});

function initialize() {
	console.log('my plugin is initializing', arguments)
}

function deinitialize() {
	console.log('my plugin is deinitializing')
}

window.registerPlugin('screens', { initialize, deinitialize });

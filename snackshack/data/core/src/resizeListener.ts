// listen to window resize changes and save them in the app's configuration
export default () => {
	const listener = () => {

	}
	window.addEventListener('resize', listener);
	return () => window.removeEventListener('resize', listener);
}

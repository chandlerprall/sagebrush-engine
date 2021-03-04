export default function createPosition(): App.Plugins['reddot']['game']['dot'] {
	const padding = 20;
	return {
		top: Math.max(padding + Math.random() * (500 - padding * 2), 50 /* avoid overlapping with the timer text */),
		left: padding + Math.random() * (500 - padding * 2),
	};
}

export default function createPosition(): App.Data['dot'] {
	const padding = 20;
	return {
		top: Math.max(padding + Math.random() * (window.innerHeight - padding * 2), 50 /* avoid overlapping with the timer text */),
		left: padding + Math.random() * (window.innerWidth - padding * 2),
	};
}

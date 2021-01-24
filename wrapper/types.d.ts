declare module 'sector-wrapper' {
	interface SectorConfig {
		pluginDirectory: string;
	}

	const start: (config: SectorConfig) => Promise<void>;
}

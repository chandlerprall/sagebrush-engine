declare module '@sagebrush/engine' {
	interface SectorConfig {
		pluginDirectory: string;
	}

	const start: (config: SectorConfig) => Promise<void>;
}

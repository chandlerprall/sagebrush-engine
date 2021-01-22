export const LOG_LEVEL_ERROR = 0;
export const LOG_LEVEL_WARN = 1;
export const LOG_LEVEL_INFO = 2;
export const LOG_LEVEL_DEBUG = 3;
export type LOG_LEVEL = typeof LOG_LEVEL_ERROR | typeof LOG_LEVEL_WARN | typeof LOG_LEVEL_INFO | typeof LOG_LEVEL_DEBUG;

export const loggers: Log[] = [];

export default class Log {
	private _level: LOG_LEVEL = LOG_LEVEL_ERROR;
	public enabled: boolean = false;

	constructor(private name: string) {
		loggers.push(this);
	}

	set level(level: 'error' | 'warn' | 'info' | 'debug') {
		if (level === 'error') this._level = 0;
		if (level === 'warn') this._level = 1;
		if (level === 'info') this._level = 2;
		if (level === 'debug') this._level = 3;
	}

	log(level: LOG_LEVEL, message: any) {
		if (this.enabled && level <= this._level) {
			console.log(`${this.name}:`, message);
		}
	}

	error(message: any) {
		this.log(LOG_LEVEL_ERROR, message);
	}

	warn(message: any) {
		this.log(LOG_LEVEL_WARN, message);
	}

	info(message: any) {
		this.log(LOG_LEVEL_INFO, message);
	}

	debug(message: any) {
		this.log(LOG_LEVEL_DEBUG, message);
	}
}

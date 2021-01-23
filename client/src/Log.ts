export const LOG_LEVEL_ERROR = 0;
export const LOG_LEVEL_WARN = 1;
export const LOG_LEVEL_INFO = 2;
export const LOG_LEVEL_DEBUG = 3;
export type LOG_LEVEL = typeof LOG_LEVEL_ERROR | typeof LOG_LEVEL_WARN | typeof LOG_LEVEL_INFO | typeof LOG_LEVEL_DEBUG;
export type LOG_LEVEL_STRING = 'error' | 'warn' | 'info' | 'debug';

const logLevelMap: { [key in LOG_LEVEL_STRING]: LOG_LEVEL } = {
	'error': 0,
	'warn': 1,
	'info': 2,
	'debug': 3,
}

export const loggers: Log[] = [];

export default class Log {
	private _level: LOG_LEVEL = LOG_LEVEL_ERROR;
	public enabled: boolean = false;

	constructor(private name: string) {
		loggers.push(this);
	}

	set level(level: LOG_LEVEL_STRING) {
		this._level = logLevelMap[level];
	}

	log(level: LOG_LEVEL_STRING, message: any) {
		const _level = logLevelMap[level];
		if (this.enabled && _level <= this._level) {
			console.log(`${this.name}:`, message);
		}
	}

	error(message: any) {
		this.log('error', message);
	}

	warn(message: any) {
		this.log('warn', message);
	}

	info(message: any) {
		this.log('info', message);
	}

	debug(message: any) {
		this.log('debug', message);
	}
}

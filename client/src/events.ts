import { onEvent } from './state';
import { messageServer } from './socket';

declare global {
	namespace App {
		interface Events {
			'APP.EXIT': null;
		}
	}
}

onEvent('APP.EXIT', () => {
	console.log('on APP.EXIT');
	messageServer('EXIT', null);
});

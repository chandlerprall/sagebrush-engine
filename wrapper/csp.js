function makeCSP({ isDevelopment, serverOrigin }) {
	return isDevelopment
		// lax CSP required for devtools
		? `default-src 'none'; connect-src ${serverOrigin} ${serverOrigin.replace('http', 'ws')}; script-src ${serverOrigin} 'sha256-/fXMeAizDJK+4tDvd/8824gAqTphH6OAa7eWO0eSx60=' devtools: 'unsafe-eval'; style-src 'unsafe-inline'; img-src devtools:;`
		: `default-src 'none'; connect-src ${serverOrigin} ${serverOrigin.replace('http', 'ws')}; script-src ${serverOrigin}; style-src 'unsafe-inline'`;
}

module.exports = makeCSP;

const { join } = require('path');

const babelConfig = {
	babelrc: false,
	presets: [
		'@babel/preset-typescript',
		['@babel/preset-env', {targets: {chrome: '87'}}],
		'@babel/preset-react',
	],
};

const IS_DEVELOPMENT = true;
const outDir = join(__dirname, 'build');

module.exports = {
	mode: IS_DEVELOPMENT ? 'development' : 'production',

	context: join(__dirname, 'src'),
	entry: '.',

	output: {
		path: outDir,
		filename: 'app.js'
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},

	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: babelConfig,
			}
		]
	}
}
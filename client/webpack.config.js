const { join } = require('path');

const babelConfig = {
	babelrc: false,
	presets: [
		'@babel/preset-typescript',
		[
			'@babel/preset-react',
			{ 'runtime': 'automatic', 'importSource': '@emotion/react' }
		],
		[
			'@babel/preset-env',
			{ targets: { chrome: '87' }, modules: false }
		],
	],
	plugins: [
		'@babel/plugin-proposal-class-properties'
	]
};

const IS_DEVELOPMENT = true;
const outDir = join(__dirname, 'build');

module.exports = {
	mode: IS_DEVELOPMENT ? 'development' : 'production',

	context: join(__dirname, 'src'),
	entry: '.',
	devtool: false,

	output: {
		path: outDir,
		filename: 'app.js',
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

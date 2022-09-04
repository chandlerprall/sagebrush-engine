const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const IS_DEVELOPMENT = false;

module.exports = {
	mode: IS_DEVELOPMENT ? 'development' : 'production',

	devtool: IS_DEVELOPMENT ? 'eval' : false,

	context: join(__dirname, 'src'),

	entry: join(__dirname, 'src', 'index.tsx'),

	output: {
		path: join(__dirname, 'dist'),
		filename: 'index.js',
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},

	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'@emotion/react/jsx-runtime': 'EmotionReactJsxRuntime',
		'@sagebrush/engine-client': 'SagebrushEngineClient',
	},

	module: {
		rules: [
			{
				test: /\.tsx?/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					babelrc: false,
					presets: [
						'@babel/preset-typescript',
						[
							'@babel/preset-react',
							{ 'runtime': 'automatic', 'importSource': '@emotion/react' }
						],
						['@babel/preset-env', {targets: {chrome: '87'}}],
					],
					plugins: [
						[
							'@emotion/babel-plugin',
							{
								sourceMap: false,
							}
						],
					]
				}
			}
		]
	},

	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: join(__dirname, 'src', 'plugin.d.ts'), to: 'plugin.d.ts' },
			],
		}),
	],
};

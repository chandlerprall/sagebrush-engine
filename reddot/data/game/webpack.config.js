const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',

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

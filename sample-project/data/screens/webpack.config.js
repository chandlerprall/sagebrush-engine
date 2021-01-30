const { join } = require('path');

module.exports = {
	mode: 'development',

	context: __dirname,

	entry: join(__dirname, 'index.tsx'),

	output: {
		path: join(__dirname, 'build'),
		filename: 'index.js',
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},

	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
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
						'@babel/preset-react',
						'@babel/preset-env',
					]
				}
			}
		]
	}
}
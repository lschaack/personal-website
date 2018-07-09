const path = require('path');

module.exports = {
	entry:'./static/src/common.ts',

	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'static/dist')
	},

	resolve: {
		extensions: ['.ts', '.js']
	},

	node: {
		fs: 'empty',
		net: 'empty'
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				// exclude: [/node_modules/],
				loader: 'ts-loader'
			}
		]
	},

	mode: 'development'
};

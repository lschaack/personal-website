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
	
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		]
	},

	mode: 'development'
};

const path = require('path');

module.exports = {
	entry:'./static/src/common.ts',

	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'static/dist')
	},

	resolve: {
		extensions: ['.ts', '.js', '.jsx']
	},
	
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.js$/,
				use: ["source-map-loader"],
				enforce: "pre"
			}
		]
	},

	mode: 'development'
};

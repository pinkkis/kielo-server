const path = require('path');

module.exports = {
	entry: './src/SocketClient/client.ts',
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	output: {
		libraryTarget: 'umd',
		filename: 'client.bundle.js',
		path: path.resolve(__dirname, 'dist/SocketClient')
	}
};
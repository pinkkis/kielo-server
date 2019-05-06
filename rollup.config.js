import { version } from './package.json';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'dist/SocketClient/client.js',
	output: {
		file: 'dist/SocketClient/client.bundle.js',
		format: 'esm',
	},
	plugins: [
		terser()
	]
}

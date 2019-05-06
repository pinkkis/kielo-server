import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	input: 'src/SocketClient/client.ts',
	output: {
		file: 'dist/SocketClient/client.bundle.js',
		format: 'esm',
	},
	plugins: [
		nodeResolve(),
		typescript(),
		process.env.NODE_ENV === 'production' ? terser() : () => {},
	]
}

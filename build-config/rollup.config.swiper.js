import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
	input: './src/Swiper/Swiper.tsx',
	output: [
		{ file: 'dist/index.esm.js', format: 'esm' },
		{ file: 'dist/index.js', format: 'cjs' },
	],
	plugins: [resolve(), typescript({ tsconfig: './build-config/tsconfig.swiper.json' })],
	external: ['react', 'react/jsx-runtime'],
}

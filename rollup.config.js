import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
	input: 'src/Swiper/Swiper.tsx',
	output: [
		{
			file: 'build/index.esm.js',
			format: 'esm',
		},
		{
			file: 'build/index.js',
			format: 'cjs',
		},
	],
	plugins: [resolve(), typescript({ tsconfig: './tsconfig.swiper.json' })],
	external: ['react', 'react/jsx-runtime'],
}

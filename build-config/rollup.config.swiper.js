import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default {
	input: './src/Swiper/Swiper.tsx',
	output: [
		{ file: 'dist/Swiper.js', format: 'cjs' },
		{ file: 'dist/Swiper.es.js', format: 'esm' },
	],
	plugins: [resolve(), typescript({ tsconfig: './build-config/tsconfig.swiper.json' }), terser()],
	external: ['react', 'react/jsx-runtime'],
}

import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
	input: './src/Swiper/Swiper.tsx',
	output: [{ file: 'dist/Swiper.js', format: 'esm' }],
	plugins: [resolve(), typescript({ tsconfig: './build-config/tsconfig.swiper.json' })],
	external: ['react', 'react/jsx-runtime'],
}

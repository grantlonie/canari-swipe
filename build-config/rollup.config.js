import mdx from '@mdx-js/rollup'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import remarkGfm from 'remark-gfm' // Tables, footnotes, strikethrough, task lists, literal URLs.
import css from 'rollup-plugin-import-css'
import livereload from 'rollup-plugin-livereload'
import globals from 'rollup-plugin-node-globals'
import serve from 'rollup-plugin-serve'

const production = !process.env.ROLLUP_WATCH
const directory = production ? 'build' : 'dev'

export default {
	input: './src/index.js',
	output: { dir: directory, format: 'es', sourcemap: true },
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
			plugins: ['@emotion/babel-plugin'],
			presets: ['@babel/preset-react'],
		}),
		commonjs(),
		resolve(),
		css(),
		typescript({ tsconfig: './tsconfig.json', outDir: directory }),
		globals(),
		mdx({ remarkPlugins: [remarkGfm] }),
		...(production ? [] : [livereload(directory), serve({ contentBase: directory })]),
	],
}

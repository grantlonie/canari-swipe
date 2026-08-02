export default {
	preset: 'ts-jest',
	rootDir: 'src',
	watchman: false,
	transform: {
		'^.+\\.(ts|tsx)?$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
}

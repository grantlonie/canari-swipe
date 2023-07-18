export default {
	preset: 'ts-jest',
	rootDir: 'src',
	transform: {
		'^.+\\.(ts|tsx)?$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
}

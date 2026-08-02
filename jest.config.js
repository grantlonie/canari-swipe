export default {
	preset: 'ts-jest',
	rootDir: 'src',
	testEnvironment: 'jsdom',
	watchman: false,
	setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts'],
	transform: {
		'^.+\\.(ts|tsx)?$': [
			'ts-jest',
			{
				tsconfig: {
					jsx: 'react-jsx',
					esModuleInterop: true,
					allowSyntheticDefaultImports: true,
				},
			},
		],
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
}

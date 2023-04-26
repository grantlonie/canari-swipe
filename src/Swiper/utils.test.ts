import { getDelta } from './utils'

describe('utils', () => {
	describe('getDelta', () => {
		test('no looping ltr', () => {
			const delta = getDelta(1, 8, false, 10)
			expect(delta).toEqual(7)
		})
		test('no looping rtl', () => {
			const delta = getDelta(8, 1, false, 10)
			expect(delta).toEqual(-7)
		})
		test('looping ltr', () => {
			const delta = getDelta(1, 8, true, 10)
			expect(delta).toEqual(-3)
			const delta2 = getDelta(5, 1, true, 10)
			expect(delta2).toEqual(-4)
		})
		test('looping rtl', () => {
			const delta = getDelta(8, 1, true, 10)
			expect(delta).toEqual(3)
			const delta2 = getDelta(1, 5, true, 10)
			expect(delta2).toEqual(4)
		})
	})
})

import { carouselIndexes, getDelta } from './utils'

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

	describe('carouselIndexes', () => {
		test('2 visible', () => {
			let flipped = carouselIndexes(4, 2, 0)
			expect(flipped).toEqual([0, 0, 0, -1])
			flipped = carouselIndexes(4, 2, 2)
			expect(flipped).toEqual([1, 0, 0, 0])
			flipped = carouselIndexes(9, 2, 2)
			expect(flipped).toEqual([0, 0, 0, 0, 0, 0, 0, 0, -1])
		})
		test('3 visible', () => {
			let flipped = carouselIndexes(5, 3, 0)
			expect(flipped).toEqual([0, 0, 0, 0, -1])
			flipped = carouselIndexes(6, 3, 0)
			expect(flipped).toEqual([0, 0, 0, 0, 0, -1])
			flipped = carouselIndexes(6, 3, 1)
			expect(flipped).toEqual([0, 0, 0, 0, 0, 0])
			flipped = carouselIndexes(6, 3, 4)
			expect(flipped).toEqual([1, 1, 1, 0, 0, 0])
			flipped = carouselIndexes(7, 3, 3)
			expect(flipped).toEqual([1, 0, 0, 0, 0, 0, 0])
		})
		test('4 visible', () => {
			let flipped = carouselIndexes(6, 4, 5)
			expect(flipped).toEqual([1, 1, 1, 1, 0, 0])
			flipped = carouselIndexes(7, 4, 1)
			expect(flipped).toEqual([0, 0, 0, 0, 0, 0, 0])
		})
	})
})

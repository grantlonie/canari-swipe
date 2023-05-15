import { Dimension, Dimensions } from './types'
import { carousel, carouselIndexes, getDelta, indexFromPosition, isPastHalfway, snapDistance } from './utils'

test('carousel', () => {
	expect(carousel(-1, 5)).toEqual(4)
	expect(carousel(2, 5)).toEqual(2)
	expect(carousel(4.9, 5)).toEqual(4.9)
	expect(carousel(5, 5)).toEqual(0)
	expect(carousel(7, 5)).toEqual(2)
})

test('isPastHalfway', () => {
	expect(isPastHalfway(0, 10)).toEqual(false)
	expect(isPastHalfway(5, 10)).toEqual(false)
	expect(isPastHalfway(5.1, 10)).toEqual(true)
	expect(isPastHalfway(9.9, 10)).toEqual(true)
})

describe('indexFromPosition', () => {
	test('align start', () => {
		const slides = makeSlides([4, 1, 8, 6])
		expect(indexFromPosition(3.9, slides)).toEqual(0)
		expect(indexFromPosition(4, slides)).toEqual(1)
		expect(indexFromPosition(4.5, slides)).toEqual(1)
		expect(indexFromPosition(5, slides)).toEqual(2)
		expect(indexFromPosition(18.9, slides)).toEqual(3)
		expect(indexFromPosition(19, slides)).toEqual(0)
	})
	test('align center', () => {
		const slides = makeSlides([4, 1, 8, 6])
		expect(indexFromPosition(2.4, slides)).toEqual(0)
		expect(indexFromPosition(2.5, slides, true)).toEqual(1)
		expect(indexFromPosition(6.9, slides, true)).toEqual(1)
		expect(indexFromPosition(7, slides, true)).toEqual(2)
		expect(indexFromPosition(14, slides, true)).toEqual(3)
		expect(indexFromPosition(18.9, slides, true)).toEqual(3)
		expect(indexFromPosition(19, slides, true)).toEqual(0)
	})
})

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
	let dimensions: Dimensions = {
		container: { span: 10, thick: 0 },
		slides: makeSlides([2, 4, 5, 4, 2]),
	}
	let flipped

	test('left aligned', () => {
		flipped = carouselIndexes(dimensions, 0, false)
		expect(flipped).toEqual([0, 0, 0, 0, -1])
		flipped = carouselIndexes(dimensions, 1, false)
		expect(flipped).toEqual([0, 0, 0, 0, 0])
		flipped = carouselIndexes(dimensions, 2, false)
		expect(flipped).toEqual([1, 1, 0, 0, 0])
		flipped = carouselIndexes(dimensions, 3, false)
		expect(flipped).toEqual([1, 1, 1, 0, 0])
		flipped = carouselIndexes(dimensions, 4, false)
		expect(flipped).toEqual([1, 1, 1, 1, 0])
	})
	test('centered', () => {
		flipped = carouselIndexes(dimensions, 0, true)
		expect(flipped).toEqual([0, 0, 0, -1, -1])
		flipped = carouselIndexes(dimensions, 1, true)
		expect(flipped).toEqual([0, 0, 0, 0, -1])
		flipped = carouselIndexes(dimensions, 2, true)
		expect(flipped).toEqual([0, 0, 0, 0, 0])
		flipped = carouselIndexes(dimensions, 3, true)
		expect(flipped).toEqual([1, 1, 0, 0, 0])
		flipped = carouselIndexes(dimensions, 4, true)
		expect(flipped).toEqual([1, 1, 1, 0, 0])
	})
})

describe.only('snapDistance', () => {
	const slides = makeSlides([2, 5, 3, 1])

	test('align start | stay', () => {
		expect(snapDistance(4, slides, 2.9)).toBeUndefined()
		expect(snapDistance(4, slides, -1.9)).toBeUndefined()
	})
	test('align start | one slide', () => {
		const forward = { single: { distance: 3, index: 2 }, total: { distance: 3, index: 2 } }
		expect(snapDistance(4, slides, 3)).toEqual(forward)
		expect(snapDistance(4, slides, 5.9)).toEqual(forward)
		const backward = { single: { distance: -2, index: 1 }, total: { distance: -2, index: 1 } }
		expect(snapDistance(4, slides, -2)).toEqual(backward)
		expect(snapDistance(4, slides, -3.9)).toEqual(backward)
	})
	test('align start | multiple', () => {
		let single = { distance: 3, index: 2 }
		expect(snapDistance(4, slides, 6)).toEqual({ single, total: { distance: 6, index: 3 } })
		expect(snapDistance(4, slides, 8.9)).toEqual({ single, total: { distance: 7, index: 0 } })
		expect(snapDistance(4, slides, 22)).toEqual({ single, total: { distance: 20, index: 1 } })
		single = { distance: -2, index: 1 }
		expect(snapDistance(4, slides, -4)).toEqual({ single, total: { distance: -4, index: 0 } })
		expect(snapDistance(4, slides, -7.9)).toEqual({ single, total: { distance: -5, index: 3 } })
		expect(snapDistance(4, slides, -22)).toEqual({ single, total: { distance: -19, index: 2 } })
	})
	test('align center | stay', () => {
		expect(snapDistance(4, slides, 3.4, true)).toBeUndefined()
		expect(snapDistance(4, slides, -0.4, true)).toBeUndefined()
	})
	test('align center | one slide', () => {
		const forward = { single: { distance: 3.5, index: 2 }, total: { distance: 3.5, index: 2 } }
		expect(snapDistance(4, slides, 3.5, true)).toEqual(forward)
		expect(snapDistance(4, slides, 5.4, true)).toEqual(forward)
		const backward = { single: { distance: -4, index: 0 }, total: { distance: -4, index: 0 } }
		expect(snapDistance(4, slides, -4, true)).toEqual(backward)
		expect(snapDistance(4, slides, -5.4, true)).toEqual(backward)
	})
	test('align center | multiple', () => {
		let single = { distance: 3.5, index: 2 }
		expect(snapDistance(4, slides, 5.5, true)).toEqual({ single, total: { distance: 5.5, index: 3 } })
		expect(snapDistance(4, slides, 6.9, true)).toEqual({ single, total: { distance: 5.5, index: 3 } })
		expect(snapDistance(4, slides, 22, true)).toEqual({ single, total: { distance: 21.5, index: 1 } })
		single = { distance: -4, index: 0 }
		expect(snapDistance(4, slides, -5.5, true)).toEqual({ single, total: { distance: -5.5, index: 3 } })
		expect(snapDistance(4, slides, -7.4, true)).toEqual({ single, total: { distance: -5.5, index: 3 } })
		expect(snapDistance(4, slides, -25, true)).toEqual({ single, total: { distance: -22.5, index: 1 } })
	})
})

function makeSlides(spans: number[]) {
	const [firstSpan, ...rest] = spans
	return rest.reduce<Dimension[]>(
		(acc, span, i) => {
			acc.push({ span, startPosition: acc[i].startPosition + acc[i].span, thick: 0 })
			return acc
		},
		[{ span: firstSpan, startPosition: 0, thick: 0 }]
	)
}

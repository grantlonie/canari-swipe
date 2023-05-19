import { Dimension, Dimensions } from './types'
import {
	carousel,
	carouselSlides,
	getDelta,
	getEndPosition,
	indexFromPosition,
	isPastHalfway,
	snapToNearest,
	snapDistance,
} from './utils'

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
		expect(indexFromPosition(3.9, slides, false)).toEqual(0)
		expect(indexFromPosition(4, slides, false)).toEqual(1)
		expect(indexFromPosition(4.5, slides, false)).toEqual(1)
		expect(indexFromPosition(5, slides, false)).toEqual(2)
		expect(indexFromPosition(18.9, slides, false)).toEqual(3)
		expect(indexFromPosition(19, slides, false)).toEqual(0)
	})
	test('align center', () => {
		const slides = makeSlides([4, 1, 8, 6])
		expect(indexFromPosition(2.4, slides, true)).toEqual(0)
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

describe('carouselSlides', () => {
	let dimensions: Dimensions = {
		container: { span: 10, thick: 0 },
		slides: makeSlides([2, 4, 5, 4, 2]),
	}
	const slides = dimensions.slides
	const totalSpan = getEndPosition(slides[slides.length - 1])
	const flipper = (flips: number[]) =>
		slides.map((s, i) => ({ ...s, startPosition: s.startPosition + flips[i] * totalSpan }))

	test('left aligned', () => {
		expect(carouselSlides(dimensions, 0, false)).toEqual(flipper([0, 0, 0, 0, -1]))
		expect(carouselSlides(dimensions, 1, false)).toEqual(flipper([0, 0, 0, 0, 0]))
		expect(carouselSlides(dimensions, 2, false)).toEqual(flipper([1, 1, 0, 0, 0]))
		expect(carouselSlides(dimensions, 3, false)).toEqual(flipper([1, 1, 1, 0, 0]))
		expect(carouselSlides(dimensions, 4, false)).toEqual(flipper([1, 1, 1, 1, 0]))
	})
	test('centered', () => {
		expect(carouselSlides(dimensions, 0, true)).toEqual(flipper([0, 0, 0, -1, -1]))
		expect(carouselSlides(dimensions, 1, true)).toEqual(flipper([0, 0, 0, 0, -1]))
		expect(carouselSlides(dimensions, 2, true)).toEqual(flipper([0, 0, 0, 0, 0]))
		expect(carouselSlides(dimensions, 3, true)).toEqual(flipper([1, 1, 0, 0, 0]))
		expect(carouselSlides(dimensions, 4, true)).toEqual(flipper([1, 1, 1, 0, 0]))
	})
})

describe('snapDistance', () => {
	const slides = makeSlides([2, 5, 3, 1])

	test('align start | stay', () => {
		expect(snapDistance(4, slides, 2.9, false)).toBeUndefined()
		expect(snapDistance(4, slides, -1.9, false)).toBeUndefined()
	})
	test('align start | one slide', () => {
		const forward = { single: { distance: 3, index: 2 }, total: { distance: 3, index: 2 } }
		expect(snapDistance(4, slides, 3, false)).toEqual(forward)
		expect(snapDistance(4, slides, 5.9, false)).toEqual(forward)
		const backward = { single: { distance: -2, index: 1 }, total: { distance: -2, index: 1 } }
		expect(snapDistance(4, slides, -2, false)).toEqual(backward)
		expect(snapDistance(4, slides, -3.9, false)).toEqual(backward)
	})
	test('align start | multiple', () => {
		let single = { distance: 3, index: 2 }
		expect(snapDistance(4, slides, 6, false)).toEqual({ single, total: { distance: 6, index: 3 } })
		expect(snapDistance(4, slides, 8.9, false)).toEqual({ single, total: { distance: 7, index: 0 } })
		expect(snapDistance(4, slides, 22, false)).toEqual({ single, total: { distance: 20, index: 1 } })
		single = { distance: -2, index: 1 }
		expect(snapDistance(4, slides, -4, false)).toEqual({ single, total: { distance: -4, index: 0 } })
		expect(snapDistance(4, slides, -7.9, false)).toEqual({ single, total: { distance: -5, index: 3 } })
		expect(snapDistance(4, slides, -22, false)).toEqual({ single, total: { distance: -19, index: 2 } })
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

describe('snapToNearest', () => {
	const slides = makeSlides([20, 40, 50, 40, 20])
	test('align left', () => {
		expect(snapToNearest(40, slides, false)).toEqual({ desiredDistance: -20, desiredIndex: 1 })
		expect(snapToNearest(41, slides, false)).toEqual({ desiredDistance: 19, desiredIndex: 2 })
		expect(snapToNearest(160, slides, false)).toEqual({ desiredDistance: -10, desiredIndex: 4 })
		expect(snapToNearest(161, slides, false)).toEqual({ desiredDistance: 9, desiredIndex: 0 })
	})
	test('align center', () => {
		expect(snapToNearest(40, slides, true)).toEqual({ desiredDistance: -10, desiredIndex: 1 })
		expect(snapToNearest(52.5, slides, true)).toEqual({ desiredDistance: -22.5, desiredIndex: 1 })
		expect(snapToNearest(52.6, slides, true)).toEqual({ desiredDistance: 22.4, desiredIndex: 2 })
		expect(snapToNearest(160, slides, true)).toEqual({ desiredDistance: -10, desiredIndex: 4 })
		expect(snapToNearest(161, slides, true)).toEqual({ desiredDistance: 9, desiredIndex: 0 })
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

import { Dimension, Dimensions } from './types'
import {
	calculateDeceleration,
	carousel,
	carouselSlides,
	easyDoesIt,
	getDelta,
	getEndPosition,
	howFar,
	howLong,
	indexFromPosition,
	isPastHalfway,
	snapDistance,
	velocityFromMovements,
} from './utils'

test('carousel', () => {
	expect(carousel(-1, 5)).toEqual(4)
	expect(carousel(2, 5)).toEqual(2)
	expect(carousel(4.9, 5)).toBeCloseTo(4.9)
	expect(carousel(5, 5)).toEqual(0)
	expect(carousel(7, 5)).toEqual(2)
	expect(carousel(3, 0)).toEqual(0)
	expect(carousel(3, -5)).toEqual(0)
	expect(carousel(NaN, 5)).toEqual(0)
	expect(carousel(3, NaN)).toEqual(0)
})

test('isPastHalfway', () => {
	expect(isPastHalfway(0, 10)).toEqual(false)
	expect(isPastHalfway(5, 10)).toEqual(false)
	expect(isPastHalfway(5.1, 10)).toEqual(true)
	expect(isPastHalfway(9.9, 10)).toEqual(true)
})

describe('velocityFromMovements', () => {
	test('returns finite velocity for normal movements', () => {
		const velocity = velocityFromMovements([
			{ pagePosition: 100, scrollPosition: 0, time: 0 },
			{ pagePosition: 50, scrollPosition: 0, time: 100 },
		])
		expect(velocity).toEqual(500)
		expect(Number.isFinite(velocity)).toBe(true)
	})

	test('returns 0 for identical timestamps', () => {
		expect(
			velocityFromMovements([
				{ pagePosition: 100, scrollPosition: 0, time: 50 },
				{ pagePosition: 40, scrollPosition: 0, time: 50 },
			])
		).toEqual(0)
	})

	test('returns 0 for zero position delta', () => {
		expect(
			velocityFromMovements([
				{ pagePosition: 100, scrollPosition: 0, time: 0 },
				{ pagePosition: 100, scrollPosition: 0, time: 100 },
			])
		).toEqual(0)
	})

	test('returns 0 for empty or incomplete movements', () => {
		expect(velocityFromMovements([])).toEqual(0)
	})
})

describe('howFar / howLong / calculateDeceleration', () => {
	test('normal values stay finite', () => {
		expect(howFar(500, 1000)).toEqual(125)
		expect(howLong(500, 1000)).toEqual(500)
		expect(calculateDeceleration(500, 125)).toEqual(1000)
	})

	test('poison inputs return 0', () => {
		expect(howFar(NaN, 1000)).toEqual(0)
		expect(howFar(Infinity, 1000)).toEqual(0)
		expect(howFar(500, 0)).toEqual(0)
		expect(howFar(500, NaN)).toEqual(0)

		expect(howLong(NaN, 1000)).toEqual(0)
		expect(howLong(Infinity, 1000)).toEqual(0)
		expect(howLong(500, 0)).toEqual(0)
		expect(howLong(500, NaN)).toEqual(0)

		expect(calculateDeceleration(NaN, 100)).toEqual(0)
		expect(calculateDeceleration(500, 0)).toEqual(0)
		expect(calculateDeceleration(Infinity, 100)).toEqual(0)
	})

	test('howLong output is safe for clock comparisons', () => {
		const duration = howLong(NaN, NaN)
		expect(0 >= duration).toBe(true)
	})
})

describe('easyDoesIt', () => {
	test.each(['linear', 'quad', 'quart', 'overshoot'] as const)('%s returns a finite progress', easing => {
		const value = easyDoesIt(0.5, easing)
		expect(Number.isFinite(value)).toBe(true)
	})

	test('unknown easing falls back to quart', () => {
		const value = easyDoesIt(0.5, 'nope' as any)
		expect(value).toEqual(easyDoesIt(0.5, 'quart'))
	})
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

	test('zero-span slides terminate', () => {
		const zeroDimensions: Dimensions = {
			container: { span: 10, thick: 0 },
			slides: makeSlides([0, 0, 0]),
		}
		expect(carouselSlides(zeroDimensions, 0, false)).toBeDefined()
	})
})

describe('snapDistance', () => {
	const slides = makeSlides([2, 5, 3, 1])
	const slidesWithGap = makeSlides([2, 5, 3, 1], 1)

	test('align start | stay', () => {
		expect(snapDistance(0, slides, 0, false)).toEqual({
			next: { distance: 2, index: 1 },
			prev: { distance: 0, index: 0 },
		})
		expect(snapDistance(4, slides, 2.9, false)).toEqual({
			next: { distance: 3, index: 2 },
			prev: { distance: -2, index: 1 },
		})
		expect(snapDistance(4, slides, -1.9, false)).toEqual({
			next: { distance: -2, index: 1 },
			prev: { distance: 3, index: 2 },
		})
	})
	test('align start | one slide', () => {
		const forward = {
			next: { distance: 3, index: 2 },
			prev: { distance: -2, index: 1 },
			total: { distance: 3, index: 2 },
		}
		expect(snapDistance(4, slides, 3, false)).toEqual(forward)
		expect(snapDistance(4, slides, 5.9, false)).toEqual(forward)
		const backward = {
			next: { distance: -2, index: 1 },
			prev: { distance: 3, index: 2 },
			total: { distance: -2, index: 1 },
		}
		expect(snapDistance(4, slides, -2, false)).toEqual(backward)
		expect(snapDistance(4, slides, -3.9, false)).toEqual(backward)
	})
	test('align start | multiple', () => {
		let next = { distance: 3, index: 2 }
		let prev = { distance: -2, index: 1 }
		expect(snapDistance(4, slides, 6, false)).toEqual({ next, prev, total: { distance: 6, index: 3 } })
		expect(snapDistance(4, slides, 8.9, false)).toEqual({ next, prev, total: { distance: 7, index: 0 } })
		expect(snapDistance(4, slides, 22, false)).toEqual({ next, prev, total: { distance: 20, index: 1 } })
		next = { distance: -2, index: 1 }
		prev = { distance: 3, index: 2 }
		expect(snapDistance(4, slides, -4, false)).toEqual({ next, prev, total: { distance: -4, index: 0 } })
		expect(snapDistance(4, slides, -7.9, false)).toEqual({ next, prev, total: { distance: -5, index: 3 } })
		expect(snapDistance(4, slides, -22, false)).toEqual({ next, prev, total: { distance: -19, index: 2 } })
	})
	test('align start | gap', () => {
		const next = { distance: 6, index: 2 }
		const prev = { distance: 0, index: 1 }
		const total = { distance: 10, index: 3 }
		expect(snapDistance(4, slidesWithGap, 10, false)).toEqual({ next, prev, total })
	})
	test('align center | stay', () => {
		expect(snapDistance(4, slides, 3.4, true)).toEqual({
			next: { distance: 3.5, index: 2 },
			prev: { distance: -0.5, index: 1 },
		})
		expect(snapDistance(4, slides, -0.4, true)).toEqual({
			next: { distance: -0.5, index: 1 },
			prev: { distance: 3.5, index: 2 },
		})
	})
	test('align center | one slide', () => {
		const forward = {
			next: { distance: 3.5, index: 2 },
			prev: { distance: -0.5, index: 1 },
			total: { distance: 3.5, index: 2 },
		}
		expect(snapDistance(4, slides, 3.5, true)).toEqual(forward)
		expect(snapDistance(4, slides, 5.4, true)).toEqual(forward)
		const backward = {
			next: { distance: -0.5, index: 1 },
			prev: { distance: 3.5, index: 2 },
			total: { distance: -4, index: 0 },
		}
		expect(snapDistance(4, slides, -4, true)).toEqual(backward)
		expect(snapDistance(4, slides, -5.4, true)).toEqual(backward)
	})
	test('align center | multiple', () => {
		let next = { distance: 3.5, index: 2 }
		let prev = { distance: -0.5, index: 1 }
		expect(snapDistance(4, slides, 5.5, true)).toEqual({ next, prev, total: { distance: 5.5, index: 3 } })
		expect(snapDistance(4, slides, 6.9, true)).toEqual({ next, prev, total: { distance: 5.5, index: 3 } })
		expect(snapDistance(4, slides, 22, true)).toEqual({ next, prev, total: { distance: 21.5, index: 1 } })
		next = { distance: -0.5, index: 1 }
		prev = { distance: 3.5, index: 2 }
		expect(snapDistance(4, slides, -5.5, true)).toEqual({ next, prev, total: { distance: -5.5, index: 3 } })
		expect(snapDistance(4, slides, -7.4, true)).toEqual({ next, prev, total: { distance: -5.5, index: 3 } })
		expect(snapDistance(4, slides, -25, true)).toEqual({ next, prev, total: { distance: -22.5, index: 1 } })
	})
	test('align center | gap', () => {
		const next = { distance: 1.5, index: 1 }
		const prev = { distance: -3, index: 0 }
		const total = { distance: 9.5, index: 3 }
		expect(snapDistance(4, slidesWithGap, 10, true)).toEqual({ next, prev, total })
	})

	test('zero-span slides terminate', () => {
		const zeroSlides = makeSlides([0, 0, 0])
		const result = snapDistance(0, zeroSlides, 100, false)
		expect(Number.isFinite(result.next.distance)).toBe(true)
		expect(Number.isFinite(result.prev.distance)).toBe(true)
	})
})

function makeSlides(spans: number[], gap = 0) {
	const [firstSpan, ...rest] = spans
	return rest.reduce<Dimension[]>(
		(acc, span, i) => {
			acc.push({ span, startPosition: acc[i].startPosition + acc[i].span + gap, thick: 0 })
			return acc
		},
		[{ span: firstSpan, startPosition: gap, thick: 0 }]
	)
}

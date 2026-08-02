import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import Swiper, { type SwiperMethods } from './Swiper'

const SLIDE_WIDTH = 100
const CONTAINER_WIDTH = 200

let clock = 1_000_000

function mockLayout(container: HTMLElement) {
	Object.defineProperty(container, 'offsetWidth', { configurable: true, value: CONTAINER_WIDTH })
	Object.defineProperty(container, 'offsetHeight', { configurable: true, value: 50 })

	Array.from(container.children).forEach(child => {
		const el = child as HTMLElement
		Object.defineProperty(el, 'offsetWidth', { configurable: true, value: SLIDE_WIDTH })
		Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 50 })
	})
}

const slides = [
	<div key="0">Slide 0</div>,
	<div key="1">Slide 1</div>,
	<div key="2">Slide 2</div>,
	<div key="3">Slide 3</div>,
]

function advanceClock(ms: number) {
	clock += ms
	act(() => {
		jest.advanceTimersByTime(ms)
	})
}

function renderSwiper(props: Partial<React.ComponentProps<typeof Swiper>> = {}) {
	const baseProps = { fit: 2 as const, gap: 0, goToTime: 200, ...props }
	const view = render(<Swiper {...baseProps}>{slides}</Swiper>)
	mockLayout(view.container.firstElementChild as HTMLElement)

	// Re-run the dimensions layout effect after sizes are mocked.
	view.rerender(
		<Swiper {...baseProps} gap={1}>
			{slides}
		</Swiper>
	)
	mockLayout(view.container.firstElementChild as HTMLElement)
	view.rerender(<Swiper {...baseProps}>{slides}</Swiper>)
	mockLayout(view.container.firstElementChild as HTMLElement)

	return { ...view, container: view.container.firstElementChild as HTMLElement }
}

function mouseSwipe(container: HTMLElement, fromX: number, toX: number) {
	fireEvent.mouseDown(container, { pageX: fromX, pageY: 10, clientX: fromX, buttons: 1 })
	advanceClock(16)
	fireEvent.mouseMove(container, { pageX: fromX - 8, pageY: 10, clientX: fromX - 8, buttons: 1 })
	advanceClock(16)
	fireEvent.mouseMove(container, { pageX: toX, pageY: 10, clientX: toX, buttons: 1 })
	advanceClock(16)
	fireEvent.mouseUp(container, { pageX: toX, pageY: 10, clientX: toX })
}

function touchSwipe(container: HTMLElement, fromX: number, toX: number) {
	const touch = (pageX: number) => ({
		targetTouches: [{ pageX, pageY: 10 }],
	})
	fireEvent.touchStart(container, touch(fromX))
	advanceClock(16)
	fireEvent.touchMove(container, touch(fromX - 8))
	advanceClock(16)
	fireEvent.touchMove(container, touch(toX))
	advanceClock(16)
	fireEvent.touchEnd(container)
}

function allTransformsFinite(container: HTMLElement) {
	return Array.from(container.children).every(child => {
		const transform = (child as HTMLElement).style.transform
		return !transform || !transform.includes('NaN')
	})
}

describe('Swiper lockup hardening', () => {
	beforeEach(() => {
		clock = 1_000_000
		jest.useFakeTimers()
		jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => clock)
	})

	afterEach(() => {
		cleanup()
		act(() => {
			jest.runOnlyPendingTimers()
		})
		jest.restoreAllMocks()
		jest.useRealTimers()
	})

	test('mouse swipe then second down/up without move settles without leftover intervals', () => {
		const onSwipeStart = jest.fn()
		const onSwipeEnd = jest.fn()
		const { container } = renderSwiper({ onSwipeStart, onSwipeEnd, stopMode: 'single' })

		mouseSwipe(container, 150, 40)
		expect(onSwipeStart).toHaveBeenCalled()
		advanceClock(1000)

		expect(onSwipeEnd).toHaveBeenCalled()
		expect(allTransformsFinite(container)).toBe(true)
		const timersAfterFirst = jest.getTimerCount()

		fireEvent.mouseDown(container, { pageX: 100, pageY: 10, clientX: 100, buttons: 1 })
		fireEvent.mouseUp(container, { pageX: 100, pageY: 10, clientX: 100 })
		advanceClock(1000)

		expect(jest.getTimerCount()).toBeLessThanOrEqual(timersAfterFirst)
		expect(allTransformsFinite(container)).toBe(true)
	})

	test('overlapping goTo during fling keeps finite position and clears intervals', () => {
		let methods: SwiperMethods | undefined
		const { container } = renderSwiper({
			onLoad: m => {
				methods = m
			},
			goToTime: 500,
			stopMode: 'free',
		})

		mouseSwipe(container, 150, 20)
		advanceClock(30)

		act(() => {
			methods?.next()
			methods?.next()
			methods?.goTo(0)
		})

		advanceClock(2000)

		expect(jest.getTimerCount()).toBe(0)
		expect(allTransformsFinite(container)).toBe(true)
	})

	test('first goTo after settle is not swallowed (dot click regression)', () => {
		let methods: SwiperMethods | undefined
		const onSwipeEnd = jest.fn()
		const { container } = renderSwiper({
			onLoad: m => {
				methods = m
			},
			onSwipeEnd,
			goToTime: 200,
			stopMode: 'single',
		})

		// Programmatic goTo that settles to the same index leaves no pending skip flag.
		act(() => {
			methods?.goTo(2)
		})
		advanceClock(500)
		expect(onSwipeEnd).toHaveBeenCalled()
		expect(jest.getTimerCount()).toBe(0)

		const endsBefore = onSwipeEnd.mock.calls.length

		// First subsequent goTo must animate (previously skipped due to stuck skipGoToEffect).
		act(() => {
			methods?.goTo(1)
		})
		advanceClock(20)
		expect(jest.getTimerCount()).toBeGreaterThan(0)

		advanceClock(500)
		expect(onSwipeEnd.mock.calls.length).toBeGreaterThan(endsBefore)
		expect(jest.getTimerCount()).toBe(0)
		expect(allTransformsFinite(container)).toBe(true)
	})

	test('identical movement timestamps do not leave an immortal interval', () => {
		const onSwipeStart = jest.fn()
		const { container } = renderSwiper({ onSwipeStart, stopMode: 'free' })

		fireEvent.mouseDown(container, { pageX: 150, pageY: 10, clientX: 150, buttons: 1 })
		fireEvent.mouseMove(container, { pageX: 140, pageY: 10, clientX: 140, buttons: 1 })
		fireEvent.mouseMove(container, { pageX: 40, pageY: 10, clientX: 40, buttons: 1 })
		fireEvent.mouseUp(container, { pageX: 40, pageY: 10, clientX: 40 })

		expect(onSwipeStart).toHaveBeenCalled()
		advanceClock(1000)

		expect(jest.getTimerCount()).toBe(0)
		expect(allTransformsFinite(container)).toBe(true)
	})

	test('unmount during animation clears intervals', () => {
		const onSwipeStart = jest.fn()
		const { container, unmount } = renderSwiper({ onSwipeStart, goToTime: 500, stopMode: 'free' })

		mouseSwipe(container, 150, 20)
		expect(onSwipeStart).toHaveBeenCalled()
		advanceClock(20)
		expect(jest.getTimerCount()).toBeGreaterThan(0)

		unmount()
		expect(jest.getTimerCount()).toBe(0)
	})

	test('touch end resets swipe flag so a subsequent tap does not fling', () => {
		const onSwipeEnd = jest.fn()
		const onSwipeStart = jest.fn()
		const { container } = renderSwiper({ onSwipeStart, onSwipeEnd, stopMode: 'single' })

		touchSwipe(container, 150, 40)
		expect(onSwipeStart).toHaveBeenCalled()
		advanceClock(1000)
		const callsAfterSwipe = onSwipeEnd.mock.calls.length
		expect(callsAfterSwipe).toBeGreaterThan(0)

		fireEvent.touchStart(container, { targetTouches: [{ pageX: 100, pageY: 10 }] })
		fireEvent.touchEnd(container)
		advanceClock(1000)

		expect(onSwipeEnd.mock.calls.length).toBe(callsAfterSwipe)
		expect(jest.getTimerCount()).toBe(0)
		expect(allTransformsFinite(container)).toBe(true)
	})

	test('stopMode settle fires onSwipeEnd and clears interval', () => {
		const onSwipeStart = jest.fn()
		const onSwipeEnd = jest.fn()
		const { container } = renderSwiper({ onSwipeStart, onSwipeEnd, stopMode: 'single' })

		mouseSwipe(container, 150, 40)
		expect(onSwipeStart).toHaveBeenCalled()
		advanceClock(2000)

		expect(onSwipeEnd).toHaveBeenCalledTimes(1)
		expect(jest.getTimerCount()).toBe(0)
		expect(allTransformsFinite(container)).toBe(true)
		expect(screen.getByText('Slide 0')).toBeInTheDocument()
	})
})

describe('Swiper controlled goTo', () => {
	beforeEach(() => {
		clock = 1_000_000
		jest.useFakeTimers()
		jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => clock)
	})

	afterEach(() => {
		cleanup()
		act(() => {
			jest.runOnlyPendingTimers()
		})
		jest.restoreAllMocks()
		jest.useRealTimers()
	})

	function Controlled({ goToTime = 200 }: { goToTime?: number }) {
		const [goTo, setGoTo] = useState(0)
		return (
			<>
				<button type="button" onClick={() => setGoTo(g => (g === 2 ? 1 : 2))}>
					Jump
				</button>
				<Swiper fit={2} gap={0} goTo={goTo} goToTime={goToTime}>
					{slides}
				</Swiper>
			</>
		)
	}

	test('rapid controlled goTo changes settle cleanly', () => {
		const view = render(<Controlled />)
		const swiper = screen.getByText('Slide 0').parentElement as HTMLElement
		mockLayout(swiper)
		view.rerender(<Controlled goToTime={201} />)
		mockLayout(screen.getByText('Slide 0').parentElement as HTMLElement)
		view.rerender(<Controlled goToTime={200} />)
		mockLayout(screen.getByText('Slide 0').parentElement as HTMLElement)

		fireEvent.click(screen.getByText('Jump'))
		advanceClock(50)
		fireEvent.click(screen.getByText('Jump'))
		advanceClock(1000)

		expect(jest.getTimerCount()).toBe(0)
		expect(allTransformsFinite(screen.getByText('Slide 0').parentElement as HTMLElement)).toBe(true)
	})
})

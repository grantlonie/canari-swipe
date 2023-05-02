import { Children, MouseEvent, TouchEvent, cloneElement, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './style.css'
import { Dimension, Movement, SwiperProps as Props } from './types'
import {
	carouselIndexes,
	clamp,
	carouselPosition,
	easeOutSine,
	getCurrentClock,
	getDeceleration,
	getDelta,
	getVelocityFromMovements,
	howFar,
	howLong,
	initialInstanceVariables,
	makeContainerStyle,
	makeSlideStyle,
	startedSwiping,
	updateDeceleration,
} from './utils'

/** how fast swiper updates after letting go */
const SWIPE_UPDATE_TIME = 10
/** ms time to go to nearest slide from stationary */
const SNAP_BACK_TIME = 300

export type SwiperProps = Props

export default function Swiper(props: SwiperProps) {
	const {
		braking,
		center,
		children,
		className,
		disabled,
		goTo: goToParent,
		goToTime,
		endMode = 'elastic',
		onLoaded,
		onMouseDown,
		onMouseLeave,
		onMouseMove,
		onMouseUp,
		onSwipeEnd,
		onSwipeStart,
		onTouchCancel,
		onTouchEnd,
		onTouchMove,
		onTouchStart,
		scale = 1,
		stopMode = 'single',
		style,
		vertical = false,
		visible = 1,
		...rest
	} = props

	const containerRef = useRef<HTMLDivElement>(null)
	const v = useRef(initialInstanceVariables)

	const [position, setPosition] = useState(0)
	const [goTo, setGoTo] = useState(goToParent)
	const [dimensions, setDimensions] = useState<{ container: Dimension; slides: Dimension[] } | null>(null)

	const slideSize = (dimensions?.container[vertical ? 'height' : 'width'] ?? 0) / visible
	const childrenArray = Children.toArray(children) as JSX.Element[] // put single child into array
	const slideCount = childrenArray.length
	const carousel = endMode === 'carousel'
	const deceleration = getDeceleration(braking)
	const currentSlide = Math.floor(slideSize ? position / slideSize : 0)
	const totalDistance = slideCount * slideSize
	const overflowCount = slideCount - (center ? 1 : visible)
	const overflowDistance = overflowCount * slideSize

	if (goToParent !== goTo) setGoTo(goToParent)

	useLayoutEffect(() => {
		const { children, offsetHeight = 0, offsetWidth = 0 } = containerRef.current || {}
		const slideElements = Array.from(children ?? [])
		const container = { height: offsetHeight, width: offsetWidth }
		const slides = slideElements.map(c => ({ height: c.clientHeight, width: c.clientWidth }))
		setDimensions({ container, slides })
	}, [children])

	useLayoutEffect(() => {
		if (!dimensions || v.current.initialized) return
		init()
		v.current.initialized = true
	}, [dimensions])

	useEffect(() => {
		if (goTo == null || !v.current.initialized) return
		goToSlide(goTo)
	}, [goTo])

	function init() {
		onLoaded?.({
			goTo: setGoTo,
			next: () => setGoTo(s => s ?? 0 + 1),
			prev: () => setGoTo(s => s ?? 0 - 1),
		})

		if (!goTo) return

		const desiredSlide = carousel ? goTo : Math.min(goTo, slideCount - visible)
		stopSwiping(desiredSlide)
	}

	function finishSwiping(distance: number, duration: number, desiredSlide?: number) {
		v.current.isSwiping = false
		const startClock = getCurrentClock()
		v.current.animationInterval = setInterval(() => {
			const clock = getCurrentClock() - startClock
			if (clock >= duration) return stopSwiping(desiredSlide)

			let newPosition = position + distance * easeOutSine(clock / duration)
			if (carousel) newPosition = carouselPosition(newPosition, totalDistance)

			setPosition(newPosition)
		}, SWIPE_UPDATE_TIME)
	}

	/** external control */
	function goToSlide(goTo: number) {
		const desiredSlide = carousel ? goTo : Math.min(goTo, slideCount - visible)
		if (!goToTime) return stopSwiping(desiredSlide)

		const distance = getDelta(position, desiredSlide * slideSize, carousel, totalDistance)
		finishSwiping(distance, goToTime, desiredSlide)
	}

	function handleTouchDown(e: TouchEvent<HTMLDivElement>) {
		const { pageX, pageY } = e.targetTouches[0]
		const pagePosition = vertical ? pageY : pageX
		handleDown(pagePosition)
	}

	function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
		const pagePosition = vertical ? e.pageY : e.pageX
		handleDown(pagePosition)
	}

	function handleDown(pagePosition: number) {
		clearInterval(v.current.animationInterval)
		v.current.isTouching = true
		const movement: Movement = { pagePosition, time: getCurrentClock() }
		v.current.movements = new Array(5).fill(movement)
	}

	function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
		const { pageX, pageY } = e.targetTouches[0]
		const pagePosition = vertical ? pageY : pageX
		handleMove(pagePosition)
	}

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		const pagePosition = vertical ? e.pageY : e.pageX
		handleMove(pagePosition)
	}

	function handleMove(pagePosition: number) {
		const { isSwiping, isTouching, movements } = v.current
		if (disabled || !isTouching || slideCount === 1) return

		// Determine when swiping begins
		if (!isSwiping) {
			const startPosition = movements[0].pagePosition
			const started = startedSwiping(pagePosition, startPosition, scale)
			if (!started) return

			v.current.isSwiping = true
			onSwipeStart?.()
		}

		const previousMovement = movements[movements.length - 1]
		const inElasticRegion = endMode === 'elastic' && (position < 0 || position > overflowDistance)
		const adjScale = scale * (inElasticRegion ? 3 : 1)
		const swipeMovement = (previousMovement.pagePosition - pagePosition) / adjScale

		let newPosition = position + swipeMovement
		if (endMode === 'carousel') newPosition = carouselPosition(newPosition, totalDistance)
		else if (endMode === 'rigid') newPosition = clamp(newPosition, 0, overflowDistance)
		setPosition(newPosition)

		v.current.movements.shift()
		const movement: Movement = { pagePosition, time: getCurrentClock() }
		v.current.movements.push(movement)
	}

	function handleUp() {
		v.current.isTouching = false
		if (!v.current.isSwiping) return

		const velocity = getVelocityFromMovements(v.current.movements)
		const desiredDistance = howFar(velocity, deceleration)
		const desiredPosition = position + Math.sign(velocity) * desiredDistance
		let maxSlides = Math.floor(desiredDistance / slideSize)

		if (!carousel) {
			if (position < 0) {
				return finishSwiping(-position, SNAP_BACK_TIME, 0)
			} else if (position > overflowDistance) {
				return finishSwiping(overflowDistance - position, SNAP_BACK_TIME, overflowCount)
			} else {
				if (desiredPosition > overflowDistance) maxSlides = overflowCount - currentSlide
				else if (desiredPosition < 0) maxSlides = currentSlide
			}
		} else if (stopMode === 'free') {
			const duration = howLong(velocity, deceleration)
			return finishSwiping(Math.sign(velocity) * desiredDistance, duration)
		}

		if (!maxSlides) {
			const pastHalfway = (position + slideSize) % slideSize > slideSize / 2
			const desiredSlide = currentSlide + (pastHalfway ? 1 : 0)
			const distance = desiredSlide * slideSize - position
			return finishSwiping(distance, SNAP_BACK_TIME, desiredSlide)
		}

		if (stopMode === 'single') maxSlides = velocity > 0 ? 1 : 0

		const desiredSlide = currentSlide + maxSlides * Math.sign(velocity)
		const distance = Math.abs(desiredSlide * slideSize - position)
		const updatedDeceleration = updateDeceleration(velocity, distance)
		const duration = howLong(velocity, updatedDeceleration)
		finishSwiping(Math.sign(velocity) * distance, duration, desiredSlide)
	}

	function stopSwiping(desiredSlide?: number) {
		if (desiredSlide) {
			const desiredOffset = desiredSlide * slideSize
			setPosition(desiredOffset)
		}

		onSwipeEnd?.(desiredSlide || currentSlide)
		clearInterval(v.current.animationInterval)
	}

	const flippedIndexes = carouselIndexes(slideCount, visible, currentSlide)

	return (
		<div
			className={className ? `canari-swipe__container ${className}` : 'canari-swipe__container'}
			ref={containerRef}
			onMouseDown={e => {
				handleMouseDown(e)
				onMouseDown?.(e)
			}}
			onTouchStart={e => {
				handleTouchDown(e)
				onTouchStart?.(e)
			}}
			onMouseMove={e => {
				handleMouseMove(e)
				onMouseMove?.(e)
			}}
			onTouchMove={e => {
				handleTouchMove(e)
				onTouchMove?.(e)
			}}
			onMouseUp={e => {
				handleUp()
				onMouseUp?.(e)
			}}
			onTouchEnd={e => {
				handleUp()
				onTouchEnd?.(e)
			}}
			onMouseLeave={e => {
				handleUp()
				onMouseLeave?.(e)
			}}
			onTouchCancel={e => {
				handleUp()
				onTouchCancel?.(e)
			}}
			style={{ ...makeContainerStyle(dimensions?.slides, vertical), ...style }}
			{...rest}
		>
			{childrenArray.map((child, i) => {
				const index = carousel ? i + flippedIndexes[i] * slideCount : i
				const containerSpan = dimensions?.container[vertical ? 'height' : 'width'] ?? 0
				const slideSpan = slideSize ?? dimensions?.slides[i][vertical ? 'height' : 'width'] ?? 0
				const offsetAmount = index * slideSize - position + (center ? containerSpan / 2 - slideSpan / 2 : 0)
				const span = containerSpan / visible
				const style = { ...makeSlideStyle(offsetAmount, span, vertical), ...child.props.style }
				const className = child.props.className
					? `canari-swipe__slide ${child.props.className}`
					: 'canari-swipe__slide'

				return cloneElement(child, { className, style })
			})}
		</div>
	)
}

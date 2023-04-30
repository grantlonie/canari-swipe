import { CSSProperties, TouchEvent, forwardRef, useEffect, useMemo, useRef, useState, MouseEvent } from 'react'
import { Movement, SwiperProps as Props } from './types'
import {
	carouselIndexes,
	clamp,
	correctPosition,
	easeOutSine,
	getCurrentClock,
	getDeceleration,
	getDelta,
	getVelocityFromMovements,
	howFar,
	howLong,
	initialInstanceVariables,
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
		children,
		visible = 1,
		braking,
		scale = 1,
		loop = false,
		mode = 'snap',
		goTo: goToParent,
		goToTime,
		onLoad,
		lazy,
		vertical,
		disabled,
		onSwipeStart,
		onSwipeEnd,
	} = props

	const currentSlideRef = useRef<HTMLDivElement>(null)
	const v = useRef(initialInstanceVariables)

	const [slideSize, setSlideSize] = useState(0)
	const [position, setPosition] = useState(0)
	const [goTo, setGoTo] = useState(goToParent)

	const slideCount = children.length
	const carousel = visible > 1
	const deceleration = getDeceleration(braking)
	const currentSlide = Math.floor(slideSize ? position / slideSize : 0)
	const totalDistance = slideCount * slideSize
	const distanceMinusVisible = totalDistance - visible * slideSize
	const location = getLocation()

	function getLocation() {
		if (position < distanceMinusVisible) return 'main'
		if (position < distanceMinusVisible + (visible / 2) * slideSize) return 'end'
		return 'start'
	}

	const wrapperStyle = useMemo(() => {
		const { width, height } = getCurrentHeightAndWidth()
		const style: CSSProperties = {
			overflow: 'hidden',
			position: 'relative',
			display: 'inline-block',
			width: vertical ? width : visible * slideSize,
			height: vertical ? visible * slideSize : height,
		}
		return style
	}, [slideSize, vertical, visible])

	useEffect(() => {
		onLoad?.({
			goTo: setGoTo,
			next: () => setGoTo(s => s ?? 0 + 1),
			prev: () => setGoTo(s => s ?? 0 - 1),
		})
	}, [])

	useEffect(() => {
		if (goToParent !== goTo) setGoTo(goToParent)
	}, [goToParent])

	useEffect(() => {
		const { width, height } = getCurrentHeightAndWidth()
		const amount = vertical ? height : width
		if (amount === slideSize) return

		setSlideSize(amount)
		setPosition(currentSlide * amount)
	}, [vertical, visible])

	useEffect(() => {
		if (goTo != null) goToSlide(goTo)
	}, [goTo])

	function finishSwiping(distance: number, duration: number) {
		v.current.isSwiping = false
		const startClock = getCurrentClock()
		v.current.animationInterval = setInterval(() => {
			const clock = getCurrentClock() - startClock
			if (clock >= duration) return stopSwiping()

			let newPosition = position + distance * easeOutSine(clock / duration)
			newPosition = correctPosition(newPosition, totalDistance)

			setPosition(newPosition)
		}, SWIPE_UPDATE_TIME)
	}

	/** external control */
	function goToSlide(goTo: number) {
		v.current.desiredSlide = loop ? goTo : Math.min(goTo, slideCount - visible)
		if (!v.current.initialized || !goToTime) {
			v.current.initialized = true
			return stopSwiping()
		}

		let distance = getDelta(position, v.current.desiredSlide * slideSize, loop, totalDistance)
		finishSwiping(distance, goToTime)
	}

	function getCurrentHeightAndWidth() {
		const { offsetWidth, offsetHeight } = currentSlideRef.current ?? {}
		return { width: offsetWidth || 0, height: offsetHeight || 0 }
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
		// For neighbors only, only allow swiping if at rest
		if (!carousel && v.current.isSwiping) return

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
		const adjScale = scale * (position > distanceMinusVisible ? 2 : 1)
		const swipeMovement = (previousMovement.pagePosition - pagePosition) / adjScale
		const newPosition = correctPosition(position + swipeMovement, totalDistance)

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

		if (!loop) {
			switch (location) {
				case 'start':
					v.current.desiredSlide = 0
					return finishSwiping(totalDistance - position, SNAP_BACK_TIME)
				case 'end':
					v.current.desiredSlide = slideCount - visible
					return finishSwiping(distanceMinusVisible - position, SNAP_BACK_TIME)
				case 'main':
					if (desiredPosition > distanceMinusVisible) maxSlides = slideCount - visible - currentSlide
					else if (desiredPosition < 0) maxSlides = currentSlide
			}
		} else if (mode === 'free') {
			const duration = howLong(velocity, deceleration)
			return finishSwiping(Math.sign(velocity) * desiredDistance, duration)
		}

		if (!maxSlides) {
			const pastHalfway = (position + slideSize) % slideSize > slideSize / 2
			v.current.desiredSlide = currentSlide + (pastHalfway ? 1 : 0)
			const distance = v.current.desiredSlide * slideSize - position
			return finishSwiping(distance, SNAP_BACK_TIME)
		}

		if (mode === 'snap') maxSlides = Math.min(maxSlides, visible)

		v.current.desiredSlide = currentSlide + maxSlides * Math.sign(velocity)
		const distance = Math.abs(v.current.desiredSlide * slideSize - position)
		const updatedDeceleration = updateDeceleration(velocity, distance)
		const duration = howLong(velocity, updatedDeceleration)
		finishSwiping(Math.sign(velocity) * distance, duration)
	}

	function stopSwiping() {
		if (v.current.desiredSlide) {
			const desiredOffset = v.current.desiredSlide * slideSize
			setPosition(desiredOffset)
		}

		onSwipeEnd?.(v.current.desiredSlide || currentSlide)
		clearInterval(v.current.animationInterval)
		// v.current.isSwiping = false
		v.current.desiredSlide = undefined
	}

	/** if !loop, determine if slide should be hidden  */
	function isHidden(isFlipped: boolean) {
		if (loop) return false

		switch (location) {
			case 'main':
				return false
			case 'start':
				return !isFlipped
			case 'end':
				return isFlipped
		}
	}

	const flippedIndexes = carouselIndexes(slideCount, visible, currentSlide)

	return (
		<div
			style={wrapperStyle}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchDown}
			onMouseMove={handleMouseMove}
			onTouchMove={handleTouchMove}
			onMouseUp={handleUp}
			onTouchEnd={handleUp}
			onMouseLeave={handleUp}
			onTouchCancel={handleUp}
		>
			{children.map((child, i) => {
				const flipped = flippedIndexes[i]
				const index = i + flipped * slideCount
				const offsetAmount = index * slideSize - position
				const ref = index === currentSlide ? currentSlideRef : undefined

				const slideProps = { key: i, child, offsetAmount, vertical, ref, hidden: isHidden(flipped !== 0) }

				if (lazy) {
					if (
						(index > currentSlide - 2 && index < currentSlide + 2) ||
						(index == 0 && currentSlide == slideCount - 1) ||
						(index == slideCount - 1 && currentSlide == 0)
					) {
						return <Slide {...slideProps} />
					} else {
						// Don't render other selections
						return null
					}
				} else {
					return <Slide {...slideProps} />
				}
			})}
		</div>
	)
}

const Slide = forwardRef<HTMLDivElement, any>(({ child, offsetAmount, vertical, hidden }, ref) => {
	let xOffset = 0
	let yOffset = 0
	if (vertical) yOffset = offsetAmount
	else xOffset = offsetAmount

	const style: CSSProperties = {
		position: 'absolute',
		transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
		...(hidden && { visibility: 'hidden' }),
	}

	return (
		<div style={style} ref={ref}>
			{child}
		</div>
	)
})

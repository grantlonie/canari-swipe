import { CSSProperties, TouchEvent, forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Movement, SwiperProps as Props } from './types'
import {
	carouselIndexes,
	correctPosition,
	getCurrentClock,
	getDeceleration,
	getDelta,
	getVelocityFromMovements,
	initialInstanceVariables,
	startedSwiping,
} from './utils'
import { MouseEvent } from 'react'

/** if carousel, then determine what velocity to stopSwiping */
const STOP_VELOCITY = 300

export type SwiperProps = Props

export default function Swiper(props: SwiperProps) {
	const {
		children,
		visible = 1,
		braking,
		scaleSwipe = 1,
		loop = false,
		mode = 'snap',
		goTo: goToParent = 0,
		goToTime,
		onLoad,
		neighborsOnly,
		vertical,
		disabled,
		onSwipeStart,
		onSwipeEnd,
	} = props

	const currentSlideRef = useRef<HTMLDivElement>(null)
	const v = useRef(initialInstanceVariables)

	// px amount of room for swiping
	const [slideSize, setSlideSize] = useState(0)
	console.log('slideSize: ', slideSize)
	const [swipePosition, setSwipePosition] = useState(0)
	const [_, setRerender] = useState(false)
	const [goTo, setGoTo] = useState(goToParent)

	const slideCount = children.length
	const carousel = visible > 1
	const deceleration = getDeceleration(braking)
	const currentSlide = Math.floor(slideSize ? swipePosition / slideSize : 0)

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
			next: () => setGoTo(s => s + 1),
			prev: () => setGoTo(s => s - 1),
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
		setSwipePosition(v.current.currentSlide * amount)
	}, [vertical, visible])

	useEffect(() => {
		if (goTo != null && goTo !== v.current.nextSlide) goToSlide(goTo)
	}, [goTo])

	// Finishes swiping after user let's go
	useEffect(() => {
		if (v.current.isTouching || !v.current.isSwiping) return

		const swipeUpdateTime = 10
		setTimeout(() => {
			// Calculate next swipe offset based on velocity
			const newClock = getCurrentClock()
			let correctedClock = newClock + (newClock < v.current.clock ? 1000 : 0)
			let newSwipePosition = Math.round(
				swipePosition + (v.current.velocity * (correctedClock - v.current.clock)) / 1000
			)

			// Slow velocity down if carousel
			if (carousel) {
				const newVelocity =
					v.current.velocity -
					deceleration * (correctedClock - v.current.clock) * Math.sign(v.current.velocity)

				// prevent sign change
				if (v.current.velocity / newVelocity < 0) {
					if (mode === 'snap') {
						v.current.velocity = STOP_VELOCITY * Math.sign(v.current.velocity)
					} else {
						stopSwiping()
						return
					}
				} else v.current.velocity = newVelocity
			}

			v.current.clock = newClock

			// Correct selection and offsets for overflow condition
			let correctedDesiredSelection = v.current.nextSlide
			let correctedOffset = v.current.desiredOffset
			if (loop) {
				if (
					v.current.currentSlide == 0 &&
					v.current.nextSlide == slideCount - 1 &&
					newSwipePosition < correctedOffset
				) {
					correctedDesiredSelection = -1
					correctedOffset = -slideSize
				} else if (
					v.current.currentSlide == slideCount - 1 &&
					v.current.nextSlide == 0 &&
					newSwipePosition > correctedOffset
				) {
					correctedDesiredSelection = slideCount
					correctedOffset = slideCount * slideSize
				}
			}
			const maxPosition = slideCount * slideSize
			newSwipePosition = correctPosition(newSwipePosition, maxPosition, loop)

			// If current selection got to desired selection
			if (
				(v.current.currentSlide > correctedDesiredSelection && newSwipePosition < correctedOffset) ||
				(v.current.currentSlide < correctedDesiredSelection && newSwipePosition > correctedOffset)
			) {
				v.current.currentSlide = v.current.nextSlide

				// Check conditions to stop swiping

				// one neighbor
				if (!carousel) stopSwiping()
				// // Beginning and end of selections
				// else if (v.current.currentSlide == 0 && v.current.velocity < 0) {
				// 	stopSwiping()
				// }
				else if (v.current.currentSlide >= slideCount - visible && v.current.velocity > 0) stopSwiping()
				else {
					let finalVelocity = STOP_VELOCITY
					if (carousel && mode === 'snap') {
						// Check if velocity is too slow to make it through next selection w/ constant acceleration formula
						finalVelocity =
							Math.sqrt(Math.pow(v.current.velocity, 2) - 2 * deceleration * 1000 * slideSize + 100) || 0
					}

					if (finalVelocity < STOP_VELOCITY) {
						stopSwiping()
					} else {
						// Continue swiping to the next selection
						v.current.nextSlide += Math.sign(v.current.velocity)
						v.current.desiredOffset = v.current.nextSlide * slideSize
						setSwipePosition(newSwipePosition)
					}
				}
			} else if (v.current.isSwiping) {
				setSwipePosition(newSwipePosition)
			}
		}, swipeUpdateTime)
	})

	/** programmatically go to slide via external control */
	function goToSlide(goTo: number) {
		v.current.nextSlide = goTo
		v.current.desiredOffset = goTo * slideSize

		// If swiper goToTime is zero (or not specified), go straight to index w/o transition
		if (!goToTime) {
			v.current.currentSlide = v.current.nextSlide
			return stopSwiping()
		}

		const delta = getDelta(v.current.currentSlide, v.current.nextSlide, loop, slideCount)
		v.current.velocity = (slideSize * delta) / goToTime
		v.current.clock = getCurrentClock()
		v.current.isSwiping = true
	}

	function getCurrentHeightAndWidth() {
		const { offsetWidth, offsetHeight } = currentSlideRef.current ?? {}
		return { width: offsetWidth || 0, height: offsetHeight || 0 }
	}

	function handleTouchDown(e: TouchEvent<HTMLDivElement>) {
		const { pageX, pageY } = e.targetTouches[0]
		const position = vertical ? pageY : pageX
		handleDown(position)
	}

	function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
		const position = vertical ? e.pageY : e.pageX
		handleDown(position)
	}

	function handleDown(position: number) {
		// For neighbors only, only allow swiping if at rest
		if (!carousel && v.current.isSwiping) return

		v.current.isTouching = true
		const movement: Movement = { position, time: getCurrentClock() }
		v.current.movements = new Array(5).fill(movement)
	}

	function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
		const { pageX, pageY } = e.targetTouches[0]
		const position = vertical ? pageY : pageX
		handleMove(position)
	}

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		const position = vertical ? e.pageY : e.pageX
		handleMove(position)
	}

	function handleMove(position: number) {
		const { isSwiping, isTouching, movements } = v.current
		if (disabled || !isTouching || slideCount === 1) return

		// Determine when swiping begins
		if (!isSwiping) {
			const startPosition = movements[0].position
			const started = startedSwiping(position, startPosition, scaleSwipe)
			if (!started) return

			v.current.isSwiping = true
			onSwipeStart?.()
		}

		const previousMovement = movements[movements.length - 1]
		const swipeMovement = (previousMovement.position - position) / scaleSwipe
		let newSwipePosition = swipePosition + swipeMovement
		const maxPosition = slideCount * slideSize
		const newPosition = correctPosition(newSwipePosition, maxPosition, loop)

		setSwipePosition(newPosition)
		v.current.movements.shift()
		const movement: Movement = { position, time: getCurrentClock() }
		v.current.movements.push(movement)
	}

	function handleUp() {
		v.current.isTouching = false
		setRerender(s => !s) // TODO - get rid of this
		if (!v.current.isSwiping) return

		v.current.velocity = getVelocityFromMovements(v.current.movements)
		const minimumSwipeSpeed = 500 // TODO - calculate this
		const fasterThanMinVelocity = Math.abs(v.current.velocity) > minimumSwipeSpeed
		if (!fasterThanMinVelocity && mode !== 'free') {
			const pastHalfWay = (swipePosition + slideSize) % slideSize > slideSize / 2
			v.current.velocity = minimumSwipeSpeed * (pastHalfWay ? 1 : -1)
		}
		// if (fasterThanMinVelocity) {
		// 	v.current.nextSlide = Math.floor(swipePosition / slideSize) + (v.current.velocity > 0 ? 1 : 0)
		// 	v.current.currentSlide = v.current.nextSlide - Math.sign(v.current.velocity)
		// } else {
		// 	v.current.nextSlide = Math.floor(swipePosition / slideSize) + (pastHalfWay ? 1 : 0)
		// 	v.current.currentSlide = v.current.nextSlide + (pastHalfWay ? -1 : 1)

		// 	if (!carousel || mode === 'snap') {
		// 		v.current.velocity = minimumSwipeSpeed * (pastHalfWay ? 1 : -1)
		// 	}
		// }

		// if (loop) {
		// 	if (v.current.currentSlide > slideCount - 1) {
		// 		v.current.currentSlide = 0
		// 		setSwipePosition(s => s - slideSize * slideCount)
		// 	} else if (v.current.currentSlide < 0) {
		// 		v.current.currentSlide = slideCount - 1
		// 		setSwipePosition(s => s + slideSize * slideCount)
		// 	}

		// 	if (v.current.nextSlide > slideCount - 1) v.current.nextSlide = 0
		// 	else if (v.current.nextSlide < 0) v.current.nextSlide = slideCount - 1
		// }

		v.current.desiredOffset = slideSize * v.current.nextSlide
		v.current.clock = getCurrentClock()
	}

	// Stop swiping method
	function stopSwiping() {
		const minimumSwipeSpeed = 500 // TODO - calculate this
		if (!carousel || mode === 'snap' || Math.abs(v.current.velocity) > minimumSwipeSpeed) {
			setSwipePosition(v.current.desiredOffset)
		}

		v.current.velocity = 0
		v.current.isSwiping = false

		if (onSwipeEnd) setTimeout(() => onSwipeEnd(v.current.currentSlide), 100)
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
				const index = i + flippedIndexes[i] * slideCount
				const offsetAmount = index * slideSize - swipePosition
				const ref = index === currentSlide ? currentSlideRef : undefined
				const slideProps = { key: i, child, offsetAmount, vertical, ref }

				if (neighborsOnly) {
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

const Slide = forwardRef<HTMLDivElement, any>(({ child, offsetAmount, vertical }, ref) => {
	let xOffset = 0
	let yOffset = 0
	if (vertical) yOffset = offsetAmount
	else xOffset = offsetAmount

	const style: CSSProperties = {
		position: 'absolute',
		transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
	}

	return (
		<div style={style} ref={ref}>
			{child}
		</div>
	)
})

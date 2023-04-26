import {
	CSSProperties,
	Children,
	TouchEvent,
	forwardRef,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { SwiperProps as Props } from './types'
import { getDeceleration, getDelta, initialInstanceVariables } from './utils'
import { MouseEvent } from 'react'

/** if carousel, then determine what velocity to stopSwiping */
const STOP_VELOCITY = 300
/** px to trigger when swiping starts */
const START_SWIPE_AMOUNT = 5

export type SwiperProps = Props

export default function Swiper(props: SwiperProps) {
	const {
		children,
		minimumSwipeSpeed = 500,
		visible = 1,
		braking,
		scaleSwipe = 1,
		loop = false,
		noDetent,
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
	const [swipePosition, setSwipePosition] = useState(0)
	const [goTo, setGoTo] = useState(goToParent)
	const [_, setRerender] = useState(false)

	const slideCount = children.length
	const carousel = visible > 1
	const deceleration = getDeceleration(braking)

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
		if (goTo != null) goToSlide(goTo)
	}, [goTo])

	// Finishes swiping after user let's go
	useEffect(() => {
		if (v.current.isTouching || !v.current.isSwiping) return

		const swipeUpdateTime = 10
		setTimeout(() => {
			// Calculate next swipe offset based on velocity
			const newClock = new Date().getMilliseconds()
			let correctedClock =
				newClock + (newClock < v.current.clock ? 1000 : 0)
			let newSwipePosition = Math.round(
				swipePosition +
					(v.current.velocity * (correctedClock - v.current.clock)) /
						1000
			)

			// Slow velocity down if carousel
			if (carousel) {
				const newVelocity =
					v.current.velocity -
					deceleration *
						(correctedClock - v.current.clock) *
						Math.sign(v.current.velocity)

				// prevent sign change
				if (v.current.velocity / newVelocity < 0) {
					if (!noDetent) {
						v.current.velocity =
							STOP_VELOCITY * Math.sign(v.current.velocity)
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

			// If current selection got to desired selection
			if (
				(v.current.currentSlide > correctedDesiredSelection &&
					newSwipePosition < correctedOffset) ||
				(v.current.currentSlide < correctedDesiredSelection &&
					newSwipePosition > correctedOffset)
			) {
				v.current.currentSlide = v.current.nextSlide

				// Check conditions to stop swiping

				// one neighbor
				if (!carousel) stopSwiping()
				// Beginning and end of selections
				else if (
					v.current.currentSlide == 0 &&
					v.current.velocity < 0
				) {
					stopSwiping()
				} else if (
					v.current.currentSlide >= slideCount - visible &&
					v.current.velocity > 0
				)
					stopSwiping()
				else {
					let finalVelocity = STOP_VELOCITY
					if (carousel && !noDetent) {
						// Check if velocity is too slow to make it through next selection w/ constant acceleration formula
						finalVelocity =
							Math.sqrt(
								Math.pow(v.current.velocity, 2) -
									2 * deceleration * 1000 * slideSize +
									100
							) || 0
					}

					if (finalVelocity < STOP_VELOCITY) {
						stopSwiping()
					} else {
						// Continue swiping to the next selection
						v.current.nextSlide += Math.sign(v.current.velocity)
						v.current.desiredOffset =
							v.current.nextSlide * slideSize
						setSwipePosition(newSwipePosition)
					}
				}
			} else if (v.current.isSwiping) {
				setSwipePosition(newSwipePosition)
			}
		}, swipeUpdateTime)
	})

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
		v.current.touchStartPosition = position
		v.current.touchEndPosition = v.current.touchStartPosition
	}

	function handleUp() {
		doneSwiping()
	}

	function handleLeave() {
		if (v.current.isTouching) {
			doneSwiping()
		}
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
		if (disabled || !v.current.isTouching || slideCount === 1) return

		if (v.current.touchEndPosition === position) return

		// Determine when swiping begins
		if (!v.current.isSwiping) {
			if (
				Math.abs(position - v.current.touchStartPosition) / scaleSwipe >
				START_SWIPE_AMOUNT
			) {
				v.current.isSwiping = true
				onSwipeStart?.()
			}

			// Swiping in progress
		} else {
			const swipeMovement =
				(v.current.touchEndPosition - position) / scaleSwipe
			v.current.touchEndPosition = position
			let newSwipePosition = swipePosition + swipeMovement

			// Prevent wrap around swiping if not wanted
			if (!loop || carousel) {
				if (swipePosition <= 0 && swipeMovement < 0)
					newSwipePosition = 0
				if (
					swipePosition >= slideSize * (slideCount - visible) &&
					swipeMovement > 0
				)
					newSwipePosition = slideSize * (slideCount - visible)
			}

			// Calculate swipe velocity and update position
			const newSwipeTimer = new Date().getMilliseconds()
			let correctedSwipeTimer =
				newSwipeTimer + (newSwipeTimer < v.current.clock ? 1000 : 0)
			v.current.velocity = Math.round(
				(swipeMovement * 1000) / (correctedSwipeTimer - v.current.clock)
			)
			v.current.clock = newSwipeTimer

			setSwipePosition(newSwipePosition)
		}
	}

	/** programmatically go to slide via external control */
	function goToSlide(goTo: number) {
		v.current.nextSlide = goTo
		v.current.desiredOffset = goTo * slideSize

		// If swiper goToTime is zero (or not specified), go straight to index w/o transition
		if (!goToTime) {
			v.current.currentSlide = v.current.nextSlide
			return stopSwiping()
		}

		const delta = getDelta(
			v.current.currentSlide,
			v.current.nextSlide,
			loop,
			slideCount
		)
		v.current.velocity = (slideSize * delta) / goToTime
		v.current.clock = new Date().getMilliseconds()
		v.current.isSwiping = true
	}

	function getCurrentHeightAndWidth() {
		const { offsetWidth, offsetHeight } = currentSlideRef.current ?? {}
		return { width: offsetWidth || 0, height: offsetHeight || 0 }
	}

	function doneSwiping() {
		if (v.current.isSwiping) {
			// If swipe is faster than minimum speed, swipe in that direction
			if (Math.abs(v.current.velocity) > minimumSwipeSpeed) {
				v.current.nextSlide =
					Math.floor(swipePosition / slideSize) +
					(v.current.velocity > 0 ? 1 : 0)
				clampDesiredSelection()
				v.current.currentSlide =
					v.current.nextSlide - Math.sign(v.current.velocity)

				// If swipe offset is past 50%, swipe in that direction, else go back to current selection
			} else {
				const goNext =
					(swipePosition + slideSize) % slideSize > slideSize / 2
				v.current.nextSlide =
					Math.floor(swipePosition / slideSize) + (goNext ? 1 : 0)
				clampDesiredSelection()
				v.current.currentSlide = v.current.nextSlide + (goNext ? -1 : 1)

				if (!carousel || !noDetent) {
					v.current.velocity = minimumSwipeSpeed * (goNext ? 1 : -1)
				}
			}

			if (loop && !carousel) {
				if (v.current.currentSlide > slideCount - 1) {
					v.current.currentSlide = 0
					setSwipePosition(s => s - slideSize * slideCount)
				} else if (v.current.currentSlide < 0) {
					v.current.currentSlide = slideCount - 1
					setSwipePosition(s => s + slideSize * slideCount)
				}

				if (v.current.nextSlide > slideCount - 1)
					v.current.nextSlide = 0
				else if (v.current.nextSlide < 0)
					v.current.nextSlide = slideCount - 1
			}

			v.current.desiredOffset = slideSize * v.current.nextSlide
			v.current.clock = new Date().getMilliseconds()
		}
		setRerender(s => !s) // needed only for carousel??
		v.current.isTouching = false
	}

	function clampDesiredSelection() {
		if (loop) return

		v.current.nextSlide = Math.min(
			Math.max(v.current.nextSlide, 0),
			Math.max(slideCount - visible, 0)
		)
	}

	// Stop swiping method
	function stopSwiping() {
		if (
			!carousel ||
			!noDetent ||
			Math.abs(v.current.velocity) > minimumSwipeSpeed
		) {
			setSwipePosition(v.current.desiredOffset)
		}

		v.current.velocity = 0
		v.current.isSwiping = false

		if (onSwipeEnd)
			setTimeout(() => onSwipeEnd(v.current.currentSlide), 100)
	}

	const pageWithStyle = Children.map(
		Children.toArray(children),
		(child, index) => {
			if (!child) return null

			// Adjust the index to allow for wrap around if wanted
			let adjustedIndex = index

			if (loop && !carousel) {
				if (slideCount === 2) {
					if (v.current.currentSlide == 0) {
						if (swipePosition < 0 && index == 1) adjustedIndex = -1
					} else if (v.current.currentSlide == 1) {
						if (swipePosition > slideSize && index == 0)
							adjustedIndex = 2
					}
				} else if (slideCount > 2) {
					if (v.current.currentSlide == 0) {
						if (index == slideCount - 1) adjustedIndex = -1
					} else if (v.current.currentSlide == slideCount - 1) {
						if (index == 0) adjustedIndex = slideCount
					}
				}
			}

			const offsetAmount = adjustedIndex * slideSize - swipePosition

			const ref =
				adjustedIndex === v.current.currentSlide
					? currentSlideRef
					: undefined

			const slideProps = {
				child,
				offsetAmount,
				vertical,
				ref,
			}

			if (neighborsOnly) {
				if (
					(adjustedIndex > v.current.currentSlide - 2 &&
						adjustedIndex < v.current.currentSlide + 2) ||
					(index == 0 && v.current.currentSlide == slideCount - 1) ||
					(index == slideCount - 1 && v.current.currentSlide == 0)
				) {
					return <Slide {...slideProps} />
				} else {
					// Don't render other selections
					return null
				}
			} else {
				return <Slide {...slideProps} />
			}
		}
	)

	return (
		<div
			style={wrapperStyle}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchDown}
			onMouseMove={handleMouseMove}
			onTouchMove={handleTouchMove}
			onMouseUp={handleUp}
			onTouchEnd={handleUp}
			onMouseLeave={handleLeave}
			onTouchCancel={handleLeave}
		>
			{pageWithStyle}
		</div>
	)
}

const Slide = forwardRef<HTMLDivElement, any>(
	({ child, offsetAmount, vertical }, ref) => {
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
	}
)

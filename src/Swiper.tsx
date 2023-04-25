import React, {
	CSSProperties,
	Children,
	forwardRef,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { SwiperProps } from './types'

export type Props = SwiperProps

/** if carousel, then determine what velocity to stopSwiping */
const STOP_VELOCITY = 300

export default function Swiper(props: Props) {
	const {
		children,
		firstSelection = 0,
		minimumSwipeSpeed = 500,
		visibleCount = 1,
		deceleration = 3,
		swipeRatio = 1,
		startSwipeAmount = 15,
		swipeAmount = 0,
		wrapAround,
		detent,
		desiredSelection,
		desiredSelectionTime,
		onLoad,
		neighborsOnly,
		vertical,
		overflow,
		disabled,
		startSwiping,
		noSelectionWrapper,
		updateCurrentSelection,
	} = props

	const childrenCount = children.length
	const currentSelection = useRef(firstSelection || 0)
	const currentSelectionRef = useRef<HTMLDivElement>(null)
	const isTouching = useRef(false)
	const isSwiping = useRef(false)
	const swipeStart = useRef(0)
	const swipeTimer = useRef(0)
	const swipeVelocity = useRef(0)
	const desiredOffset = useRef(0)
	const nextSelection = useRef(currentSelection.current)
	const lastTouchLocation = useRef(swipeStart.current)
	const onSwipeSpace = useRef(false)
	const [swipeAmountAdj, setSwipeAmountAdj] = useState(swipeAmount)
	const [swipePosition, setSwipePosition] = useState(
		currentSelection.current * swipeAmount
	)
	const [_, setRerender] = useState(false)
	const carousel = visibleCount > 1

	const wrapperStyle = useMemo(() => {
		const { width, height } = getCurrentHeightAndWidth()
		const style: CSSProperties = {
			overflow: overflow ? 'visible' : 'hidden',
			position: 'relative',
			display: 'inline-block',
			width: vertical ? width : visibleCount * swipeAmountAdj,
			height: vertical ? visibleCount * swipeAmountAdj : height,
		}
		return style
	}, [swipeAmountAdj, vertical, visibleCount])

	useEffect(() => {
		let amount = swipeAmount
		if (!amount) {
			const { width, height } = getCurrentHeightAndWidth()
			amount = vertical ? height : width
		}
		if (amount !== swipeAmountAdj) {
			setSwipeAmountAdj(amount)
			setSwipePosition(currentSelection.current * amount)
		}
	}, [swipeAmount, vertical])

	function getCurrentHeightAndWidth() {
		const { offsetWidth, offsetHeight } = currentSelectionRef.current ?? {}
		return { width: offsetWidth || 0, height: offsetHeight || 0 }
	}

	function handleTouchDown(e) {
		handleMouseDown({
			pageX: e.targetTouches[0].pageX,
			pageY: e.targetTouches[0].pageY,
		})
	}

	function handleMouseDown(e) {
		// For neighbors only, only allow swiping if at rest
		if (carousel || !isSwiping.current) {
			isTouching.current = true
			swipeStart.current = vertical ? e.pageY : e.pageX
			lastTouchLocation.current = swipeStart.current
			onSwipeSpace.current = true
		}
	}

	function handleMouseUp() {
		doneSwiping()
	}

	function handleMouseLeave() {
		if (isTouching.current) {
			onSwipeSpace.current = false // signify letting go outside swipe space
			doneSwiping()
		}
	}

	function doneSwiping() {
		if (isSwiping.current) {
			// If swipe is faster than minimum speed, swipe in that direction
			if (Math.abs(swipeVelocity.current) > minimumSwipeSpeed) {
				nextSelection.current =
					Math.floor(swipePosition / swipeAmountAdj) +
					(swipeVelocity.current > 0 ? 1 : 0)
				clampDesiredSelection()
				currentSelection.current =
					nextSelection.current - Math.sign(swipeVelocity.current)

				// If swipe offset is past 50%, swipe in that direction, else go back to current selection
			} else {
				const goNext =
					(swipePosition + swipeAmountAdj) % swipeAmountAdj >
					swipeAmountAdj / 2
				nextSelection.current =
					Math.floor(swipePosition / swipeAmountAdj) +
					(goNext ? 1 : 0)
				clampDesiredSelection()
				currentSelection.current =
					nextSelection.current + (goNext ? -1 : 1)

				if (!carousel || detent) {
					swipeVelocity.current =
						minimumSwipeSpeed * (goNext ? 1 : -1)
				}
			}

			if (wrapAround && !carousel) {
				if (currentSelection.current > childrenCount - 1) {
					currentSelection.current = 0
					setSwipePosition(s => s - swipeAmountAdj * childrenCount)
				} else if (currentSelection.current < 0) {
					currentSelection.current = childrenCount - 1
					setSwipePosition(s => s + swipeAmountAdj * childrenCount)
				}

				if (nextSelection.current > childrenCount - 1)
					nextSelection.current = 0
				else if (nextSelection.current < 0)
					nextSelection.current = childrenCount - 1
			}

			desiredOffset.current = swipeAmountAdj * nextSelection.current
			swipeTimer.current = new Date().getMilliseconds()
		}
		setRerender(s => !s) // needed only for carousel??
		isTouching.current = false
	}

	function clampDesiredSelection() {
		if (wrapAround) return

		nextSelection.current = Math.min(
			Math.max(nextSelection.current, 0),
			Math.max(childrenCount - visibleCount, 0)
		)
	}

	function handleTouchMove(e) {
		handleMouseMove({
			pageX: e.targetTouches[0].pageX,
			pageY: e.targetTouches[0].pageY,
		})
	}

	function handleMouseMove(e) {
		if (disabled || !isTouching.current || childrenCount === 1) return

		const touchLocation = vertical ? e.pageY : e.pageX
		if (lastTouchLocation.current === touchLocation) return

		// Determine when swiping begins
		if (!isSwiping.current) {
			if (
				Math.abs(touchLocation - swipeStart.current) / swipeRatio >
				startSwipeAmount
			) {
				isSwiping.current = true
				startSwiping?.()
			}

			// Swiping in progress
		} else {
			const swipeMovement =
				(lastTouchLocation.current - touchLocation) / swipeRatio
			lastTouchLocation.current = touchLocation
			let newSwipePosition = swipePosition + swipeMovement

			// Prevent wrap around swiping if not wanted
			if (!wrapAround || carousel) {
				if (swipePosition <= 0 && swipeMovement < 0)
					newSwipePosition = 0
				if (
					swipePosition >=
						swipeAmountAdj * (childrenCount - visibleCount) &&
					swipeMovement > 0
				)
					newSwipePosition =
						swipeAmountAdj * (childrenCount - visibleCount)
			}

			// Calculate swipe velocity and update position
			const newSwipeTimer = new Date().getMilliseconds()
			let correctedSwipeTimer =
				newSwipeTimer + (newSwipeTimer < swipeTimer.current ? 1000 : 0)
			swipeVelocity.current = Math.round(
				(swipeMovement * 1000) /
					(correctedSwipeTimer - swipeTimer.current)
			)
			swipeTimer.current = newSwipeTimer

			setSwipePosition(newSwipePosition)
		}
	}

	// See if the user requests a new selection without swiping (ex. clicking home button)
	useEffect(() => {
		if (desiredSelection == null) return

		nextSelection.current = desiredSelection
		desiredOffset.current = desiredSelection * swipeAmountAdj

		// If swiper desiredSelectionTime is zero (or not specified), go straight to index w/o transition
		if (!desiredSelectionTime) {
			currentSelection.current = nextSelection.current
			stopSwiping()

			// Transition swipe to desiredSelection
		} else {
			const selectionDelta =
				currentSelection.current - nextSelection.current
			// Allow for swiping to neighbor on other side of wrap around
			if (
				wrapAround &&
				childrenCount > 2 &&
				((currentSelection.current == 0 &&
					nextSelection.current == childrenCount - 1) ||
					(currentSelection.current == childrenCount - 1 &&
						nextSelection.current == 0))
			) {
				swipeVelocity.current =
					((swipeAmountAdj *
						(childrenCount - Math.abs(selectionDelta))) /
						desiredSelectionTime) *
					Math.sign(selectionDelta)
			} else {
				swipeVelocity.current =
					(-swipeAmountAdj * selectionDelta) / desiredSelectionTime
			}

			swipeTimer.current = new Date().getMilliseconds()
			isSwiping.current = true
		}
	}, [desiredSelection])

	// Finishes swiping after user let's go
	useEffect(() => {
		if (isTouching.current || !isSwiping.current) return

		const swipeUpdateTime = 10
		setTimeout(() => {
			// Calculate next swipe offset based on velocity
			const newSwipeTimer = new Date().getMilliseconds()
			let correctedSwipeTimer =
				newSwipeTimer + (newSwipeTimer < swipeTimer.current ? 1000 : 0)
			let newSwipePosition = Math.round(
				swipePosition +
					(swipeVelocity.current *
						(correctedSwipeTimer - swipeTimer.current)) /
						1000
			)

			// Slow velocity down if carousel
			if (carousel) {
				const newVelocity =
					swipeVelocity.current -
					deceleration *
						(correctedSwipeTimer - swipeTimer.current) *
						Math.sign(swipeVelocity.current)

				// prevent sign change
				if (swipeVelocity.current / newVelocity < 0) {
					if (detent) {
						swipeVelocity.current =
							STOP_VELOCITY * Math.sign(swipeVelocity.current)
					} else {
						stopSwiping()
						return
					}
				} else swipeVelocity.current = newVelocity
			}

			swipeTimer.current = newSwipeTimer

			// Correct selection and offsets for overflow condition
			let correctedDesiredSelection = nextSelection.current
			let correctedOffset = desiredOffset.current
			if (wrapAround) {
				if (
					currentSelection.current == 0 &&
					nextSelection.current == childrenCount - 1 &&
					newSwipePosition < correctedOffset
				) {
					correctedDesiredSelection = -1
					correctedOffset = -swipeAmountAdj
				} else if (
					currentSelection.current == childrenCount - 1 &&
					nextSelection.current == 0 &&
					newSwipePosition > correctedOffset
				) {
					correctedDesiredSelection = childrenCount
					correctedOffset = childrenCount * swipeAmountAdj
				}
			}

			// If current selection got to desired selection
			if (
				(currentSelection.current > correctedDesiredSelection &&
					newSwipePosition < correctedOffset) ||
				(currentSelection.current < correctedDesiredSelection &&
					newSwipePosition > correctedOffset)
			) {
				currentSelection.current = nextSelection.current

				// Check conditions to stop swiping

				// one neighbor
				if (!carousel) stopSwiping()
				// Beginning and end of selections
				else if (
					currentSelection.current == 0 &&
					swipeVelocity.current < 0
				) {
					stopSwiping()
				} else if (
					currentSelection.current >= childrenCount - visibleCount &&
					swipeVelocity.current > 0
				)
					stopSwiping()
				else {
					let finalVelocity = STOP_VELOCITY
					if (carousel && detent) {
						// Check if velocity is too slow to make it through next selection w/ constant acceleration formula
						finalVelocity =
							Math.sqrt(
								Math.pow(swipeVelocity.current, 2) -
									2 * deceleration * 1000 * swipeAmountAdj +
									100
							) || 0
					}

					if (finalVelocity < STOP_VELOCITY) {
						stopSwiping()
					} else {
						// Continue swiping to the next selection
						nextSelection.current += Math.sign(
							swipeVelocity.current
						)
						desiredOffset.current =
							nextSelection.current * swipeAmountAdj
						setSwipePosition(newSwipePosition)
					}
				}
			} else if (isSwiping.current) {
				console.log('2')
				setSwipePosition(newSwipePosition)
			}
		}, swipeUpdateTime)
	})

	// Stop swiping method
	function stopSwiping() {
		if (
			!carousel ||
			detent ||
			Math.abs(swipeVelocity.current) > minimumSwipeSpeed
		) {
			setSwipePosition(desiredOffset.current)
		}

		swipeVelocity.current = 0
		isSwiping.current = false

		if (updateCurrentSelection)
			setTimeout(
				() =>
					updateCurrentSelection(
						currentSelection.current,
						onSwipeSpace.current
					),
				100
			)
	}

	useEffect(() => {
		onLoad?.({
			reset: () => setSwipePosition(firstSelection * swipeAmountAdj),
		})
	}, [])

	const pageWithStyle = Children.map(
		Children.toArray(children),
		(child, index) => {
			if (!child) return null

			// Adjust the index to allow for wrap around if wanted
			let adjustedIndex = index

			if (wrapAround && !carousel) {
				if (childrenCount === 2) {
					if (currentSelection.current == 0) {
						if (swipePosition < 0 && index == 1) adjustedIndex = -1
					} else if (currentSelection.current == 1) {
						if (swipePosition > swipeAmountAdj && index == 0)
							adjustedIndex = 2
					}
				} else if (childrenCount > 2) {
					if (currentSelection.current == 0) {
						if (index == childrenCount - 1) adjustedIndex = -1
					} else if (currentSelection.current == childrenCount - 1) {
						if (index == 0) adjustedIndex = childrenCount
					}
				}
			}

			const offsetAmount = adjustedIndex * swipeAmountAdj - swipePosition

			const ref =
				adjustedIndex === currentSelection.current
					? currentSelectionRef
					: undefined

			const itemProps = {
				child,
				offsetAmount,
				noSelectionWrapper,
				vertical,
				ref,
			}

			if (neighborsOnly) {
				if (
					(adjustedIndex > currentSelection.current - 2 &&
						adjustedIndex < currentSelection.current + 2) ||
					(index == 0 &&
						currentSelection.current == childrenCount - 1) ||
					(index == childrenCount - 1 &&
						currentSelection.current == 0)
				) {
					return <Item {...itemProps} />
				} else {
					// Don't render other selections
					return null
				}
			} else {
				return <Item {...itemProps} />
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
			onMouseUp={handleMouseUp}
			onTouchEnd={handleMouseUp}
			onMouseLeave={handleMouseLeave}
			onTouchCancel={handleMouseLeave}
		>
			{pageWithStyle}
		</div>
	)
}

const Item = forwardRef<HTMLDivElement, any>(
	({ child, offsetAmount, noSelectionWrapper, vertical }, ref) => {
		let xOffset = 0
		let yOffset = 0
		if (vertical) yOffset = offsetAmount
		else xOffset = offsetAmount

		const style: CSSProperties = {
			position: 'absolute',
			transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
		}

		if (noSelectionWrapper) {
			const clonedStyle = Object.assign({}, child.props.style, style)
			return React.cloneElement(child, { style: clonedStyle, ref })
		}

		return (
			<div style={style} ref={ref}>
				{child}
			</div>
		)
	}
)

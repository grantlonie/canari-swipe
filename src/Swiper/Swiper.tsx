import {
	Children,
	HTMLProps,
	MouseEvent,
	TouchEvent,
	cloneElement,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import './style'
import { Dimensions, Movement } from './types'
import {
	calculateDeceleration,
	carousel,
	carouselSlides,
	clamp,
	easeOutSine,
	getContainerStyle,
	getCurrentClock,
	getDeceleration,
	getDelta,
	getEndPosition,
	howFar,
	howLong,
	indexFromPosition,
	initialInstanceVariables,
	makeDimensions,
	makeSlideStyle,
	snapDistance,
	snapToNearest,
	startedSwiping,
	velocityFromMovements,
} from './utils'

/** how fast swiper updates after letting go */
const SWIPE_UPDATE_TIME = 10
/** ms time to go to nearest slide from stationary */
const SNAP_BACK_TIME = 200

export interface SwiperProps extends HTMLProps<HTMLDivElement> {
	/** (default start) align the slides with the start or center of the container */
	align?: 'center' | 'start'
	/** (default medium) how hard to brake swiping animation after letting go  */
	braking?: 'soft' | 'medium' | 'hard'
	children: JSX.Element[] | JSX.Element
	/** prevent dragging slides */
	disabled?: boolean
	/** (default elastic) apply elastic effect or rigid at the end of the slides or carousel them back around */
	endMode?: 'elastic' | 'rigid' | 'carousel'
	/** fit number of slides in container */
	fit?: number
	/** (default 0) used to set initial slide and to control externally */
	goTo?: number
	/** (default 500ms) time it takes to transition to desired slide */
	goToTime?: number
	/** called when swiping starts */
	onSwipeStart?: () => void
	/** called when swiping ends with current slide*/
	onSwipeEnd?: (slide: number) => void
	/** return callable methods */
	onLoaded?: (methods: Methods) => void
	/** (default 1) helpful when applying transform scale to swiper to match swipe movements */
	scale?: number
	/** (default single) stop after a single slide, animate slides per braking stopping on whole slide (multiple) or wherever it lies (free)  */
	stopMode?: 'single' | 'multiple' | 'free'
	/** change to vertical swiper */
	vertical?: boolean
}

interface Methods {
	/** go to a slide */
	goTo: (slide: number) => void
	/** go to next slide */
	next: () => void
	/** go to previous slide */
	prev: () => void
}

export default function Swiper(props: SwiperProps) {
	const {
		align = 'start',
		braking,
		children,
		className,
		disabled,
		fit,
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
		...rest
	} = props

	const containerRef = useRef<HTMLDivElement>(null)
	const v = useRef(initialInstanceVariables)

	const [position, setPosition] = useState(0)
	const [goTo, setGoTo] = useState(goToParent)
	const [dimensions, setDimensions] = useState<Dimensions | null>(null)

	const childrenArray = Children.toArray(children) as JSX.Element[]
	const slideCount = childrenArray.length
	const isCarousel = endMode === 'carousel'
	const center = align === 'center'
	const { container, slides = [] } = dimensions ?? {}
	const currentIndex = indexFromPosition(position, slides, center)
	const lastSlide = slides[slides.length - 1]
	const totalSpan = getEndPosition(lastSlide)
	const overflowDistance = totalSpan - ((center ? lastSlide?.span : container?.span) ?? 0)
	const adjSlides = isCarousel ? carouselSlides(dimensions, currentIndex, center) : slides

	if (goToParent !== goTo) setGoTo(goToParent)

	useLayoutEffect(() => {
		if (!containerRef.current) return
		setDimensions(makeDimensions(containerRef.current, vertical, fit))
	}, [children, fit])

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

		if (goTo) stopSwiping(goTo)
	}

	function goToSlide(goTo: number) {
		if (!goToTime) return stopSwiping(goTo)

		const desiredPosition = slides[goTo].startPosition
		const newPosition = isCarousel ? desiredPosition : Math.min(desiredPosition, overflowDistance)
		const distance = getDelta(position, newPosition, isCarousel, totalSpan)
		finishSwiping(distance, goToTime, goTo)
	}

	function finishSwiping(distance: number, duration: number, desiredSlide?: number) {
		v.current.isSwiping = false
		const startClock = getCurrentClock()
		v.current.animationInterval = setInterval(() => {
			const clock = getCurrentClock() - startClock
			if (clock >= duration) return stopSwiping(desiredSlide)

			let newPosition = position + distance * easeOutSine(clock / duration)
			if (isCarousel) newPosition = carousel(newPosition, totalSpan)

			setPosition(newPosition)
		}, SWIPE_UPDATE_TIME)
	}

	function stopSwiping(desiredSlide?: number) {
		if (desiredSlide) {
			const { span, startPosition } = slides[desiredSlide]
			const desiredPosition = startPosition + (center ? span / 2 - slides[0].span / 2 : 0)
			const newPosition = isCarousel ? desiredPosition : Math.min(desiredPosition, overflowDistance)
			setPosition(newPosition)
		}

		onSwipeEnd?.(desiredSlide || currentIndex)
		clearInterval(v.current.animationInterval)
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
		if (endMode === 'carousel') newPosition = carousel(newPosition, totalSpan)
		else if (endMode === 'rigid') newPosition = clamp(newPosition, overflowDistance)
		setPosition(newPosition)

		v.current.movements.shift()
		const movement: Movement = { pagePosition, time: getCurrentClock() }
		v.current.movements.push(movement)
	}

	function handleUp() {
		v.current.isTouching = false
		if (!v.current.isSwiping) return

		const deceleration = getDeceleration(braking)
		let velocity = velocityFromMovements(v.current.movements)
		let desiredDistance = howFar(velocity, deceleration)
		let desiredIndex: number | undefined

		if (!isCarousel) {
			if (position < 0) {
				return finishSwiping(-position, SNAP_BACK_TIME, 0)
			} else if (position > overflowDistance) {
				return finishSwiping(overflowDistance - position, SNAP_BACK_TIME, slideCount - 1)
			} else {
				desiredDistance = clamp(desiredDistance, overflowDistance - position, -position)
			}
		}

		if (stopMode !== 'free') {
			const snappedDistance = snapDistance(position, slides, desiredDistance, center)
			if (!snappedDistance) {
				const n = snapToNearest(position, slides, center)
				desiredDistance = n.desiredDistance
				desiredIndex = n.desiredIndex
				velocity = (desiredDistance / SNAP_BACK_TIME) * 1000
			} else {
				const { single, total } = snappedDistance
				desiredDistance = stopMode === 'single' ? single.distance : total.distance
				desiredIndex = stopMode === 'single' ? single.index : total.index
			}
		}

		const updatedDeceleration = calculateDeceleration(velocity, Math.abs(desiredDistance))
		const duration = howLong(velocity, updatedDeceleration)
		finishSwiping(desiredDistance, duration, desiredIndex)
	}

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
			style={{ ...style, ...getContainerStyle(container?.thick, vertical) }}
			{...rest}
		>
			{childrenArray.map((child, i) => {
				const { startPosition = 0, span = 0 } = adjSlides?.[i] ?? {}
				let offsetAmount = startPosition - position
				if (center) offsetAmount += ((container?.span ?? 0) - (slides[0]?.span ?? 0)) / 2
				const style = { ...makeSlideStyle(offsetAmount, span, vertical, Boolean(fit)), ...child.props.style }
				const className = child.props.className
					? `canari-swipe__slide ${child.props.className}`
					: 'canari-swipe__slide'

				return cloneElement(child, { className, style })
			})}
		</div>
	)
}

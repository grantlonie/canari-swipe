import {
	Children,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type HTMLAttributes,
	type HTMLProps,
	type MouseEvent,
	type TouchEvent,
} from 'react'
import './style'
import { Dimensions, Movement } from './types'
import {
	calculateDeceleration,
	carousel,
	carouselSlides,
	centerCorrection,
	clamp,
	easeOutSine,
	getContainerStyle,
	getCurrentClock,
	getDeceleration,
	getDelta,
	getTotalSpan,
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

export declare interface SwiperProps extends Omit<HTMLProps<HTMLDivElement>, 'onLoad'> {
	/** (default start) align the slides with the start or center of the container */
	align?: 'center' | 'start'
	/** (default 5000) 1 - 100. How hard to brake swiping animation after letting go */
	braking?: number
	children: JSX.Element[] | JSX.Element
	/** prevent dragging slides */
	disabled?: boolean
	/** (default elastic) apply elastic effect or rigid at the end of the slides or carousel them back around */
	endMode?: 'elastic' | 'rigid' | 'carousel'
	/** fit number of slides in container */
	fit?: number
	/** (default 0) px gap between slide */
	gap?: number
	/** (default 0) used to set initial slide and to control externally */
	goTo?: number
	/** (default 500ms) time it takes to transition to desired slide */
	goToTime?: number
	/** called when swiping starts */
	onSwipeStart?: () => void
	/** called when swiping ends with current slide*/
	onSwipeEnd?: (slide: number) => void
	/** return callable methods */
	onLoad?: (methods: SwiperMethods) => void
	/** Render component over swiper (used for controls, fade effect, etc.) */
	overlay?: (props: HTMLAttributes<HTMLDivElement>, currentIndex: number, methods: SwiperMethods) => JSX.Element
	/** (default 1) helpful when applying transform scale to swiper to match swipe movements */
	scale?: number
	/** (default single) stop after a single slide, animate slides per braking stopping on whole slide (multiple) or wherever it lies (free)  */
	stopMode?: 'single' | 'multiple' | 'free'
	/** change to vertical swiper */
	vertical?: boolean
}

export declare interface SwiperMethods {
	/** go to a slide */
	goTo: (slide: number) => void
	/** go to next slide */
	next: () => void
	/** go to previous slide */
	prev: () => void
}

export default function Swiper(props: SwiperProps): JSX.Element {
	const {
		align = 'start',
		braking,
		children,
		className,
		disabled,
		fit,
		gap = 0,
		goTo: goToParent = 0,
		goToTime,
		endMode = 'elastic',
		onLoad,
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
		overlay,
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
	const [dimensions, setDimensions] = useState<Dimensions | undefined>()

	const childrenArray = Children.toArray(children) as JSX.Element[]
	const slideCount = childrenArray.length
	const isCarousel = endMode === 'carousel'
	const center = align === 'center'
	const { container, slides = [] } = dimensions ?? {}
	const currentIndex = indexFromPosition(position, slides, center)
	const { totalSpan, overflowDistance } = getTotalSpan(dimensions, center)
	const hasOverlay = Boolean(overlay)

	const slideCountRef = useRef(0)
	slideCountRef.current = slideCount
	const goToRef = useRef(0)
	goToRef.current = goTo

	useLayoutEffect(() => {
		updateDimensions()
		window.addEventListener('resize', () => updateDimensions())
		return window.removeEventListener('resize', () => updateDimensions())
	}, [children, fit, hasOverlay, vertical])

	useLayoutEffect(() => {
		if (!dimensions || v.current.initialized) return
		init()
		v.current.initialized = true
	}, [dimensions])

	useEffect(() => {
		setGoTo(goToParent)
	}, [goToParent])

	useEffect(() => {
		if (!v.current.initialized) return
		goToSlide(goTo)
	}, [goTo])

	useEffect(() => {
		const { children } = containerRef.current || {}
		if (!children) return

		let slideElements = Array.from(children) as HTMLElement[]
		if (hasOverlay) slideElements.shift()
		const adjSlides = isCarousel ? carouselSlides(dimensions, currentIndex, center) : slides

		slideElements.forEach((slide, i) => {
			const { startPosition = 0, span = 0 } = adjSlides?.[i] ?? {}
			let offsetAmount = startPosition - position
			if (center) offsetAmount += ((container?.span ?? 0) - (slides[0]?.span ?? 0)) / 2
			const style = makeSlideStyle(offsetAmount, span, vertical, Boolean(fit))

			for (let key in style) {
				slide.style[key] = style[key]
			}
		})
	})

	function updateDimensions() {
		if (!containerRef.current) return
		const dimensions = makeDimensions(containerRef.current, gap, vertical, hasOverlay, fit)
		setDimensions(dimensions)
		setPosition(positionFromIndex(dimensions, goToRef.current))
	}

	const methods = useMemo(
		() => ({
			goTo: v => setGoTo(carousel(v, slideCountRef.current)),
			next: () => setGoTo(s => carousel(s + 1, slideCountRef.current)),
			prev: () => setGoTo(s => carousel(s - 1, slideCountRef.current)),
		}),
		[]
	)

	function init() {
		onLoad?.(methods)

		if (goTo) stopSwiping(goTo)
	}

	function goToSlide(goTo: number) {
		if (!goToTime) return stopSwiping(goTo)

		const newPosition = positionFromIndex(dimensions, goTo)
		const distance = getDelta(position, newPosition, isCarousel, totalSpan)
		finishSwiping(distance, goToTime, goTo)
	}

	function finishSwiping(distance: number, duration: number, desiredIndex?: number) {
		v.current.isSwiping = false
		const startClock = getCurrentClock()
		v.current.animationInterval = setInterval(() => {
			const clock = getCurrentClock() - startClock
			if (clock >= duration) return stopSwiping(desiredIndex)

			let newPosition = position + distance * easeOutSine(clock / duration)
			if (isCarousel) newPosition = carousel(newPosition, totalSpan)

			setPosition(newPosition)
		}, SWIPE_UPDATE_TIME)
	}

	function stopSwiping(desiredIndex?: number) {
		if (desiredIndex != null) {
			setPosition(positionFromIndex(dimensions, desiredIndex))
			setGoTo(desiredIndex)
		}

		onSwipeEnd?.(desiredIndex || currentIndex)
		clearInterval(v.current.animationInterval)
	}

	function positionFromIndex(dimensions: Dimensions | undefined, index: number) {
		if (!dimensions) return 0

		const { overflowDistance } = getTotalSpan(dimensions, center)
		const { slides } = dimensions
		const { startPosition } = slides[index]
		const desiredPosition = startPosition + (center ? centerCorrection(slides, index) : 0)
		return isCarousel ? desiredPosition : Math.min(desiredPosition, overflowDistance)
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
		else if (endMode === 'rigid') newPosition = clamp(newPosition, overflowDistance, gap)
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
			className={`canari-swipe__container${className ? ' ' + className : ''}`}
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
			{overlay?.({ className: 'canari-swipe__overlay' }, currentIndex, methods)}
			{children}
		</div>
	)
}

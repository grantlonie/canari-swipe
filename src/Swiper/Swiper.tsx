import {
	Children,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type HTMLProps,
	type MouseEvent,
	type TouchEvent,
} from 'react'
import addStyle from './style'
import { Dimensions, Movement } from './types'
import {
	calculateDeceleration,
	carousel,
	carouselSlides,
	centerCorrection,
	clamp,
	easyDoesIt,
	getContainerStyle,
	getCurrentClock,
	getDeceleration,
	getDelta,
	getTotalSpan,
	handlePreventDefault,
	howFar,
	howLong,
	indexFromPosition,
	initialInstanceVariables,
	isEqual,
	makeDimensions,
	makeSlideStyle,
	snapDistance,
	startedSwiping,
	velocityFromMovements,
} from './utils'

/** how fast swiper updates after letting go */
const SWIPE_UPDATE_TIME = 10
/** ms time to go to nearest slide from stationary */
const SNAP_BACK_TIME = 200
/** px/sec^2 deceleration required to get to next slide (if stopMode !== 'free') regardless of braking */
const MIN_DECELERATION_TO_NEXT = 1000

export declare interface SwiperProps extends Omit<HTMLProps<HTMLDivElement>, 'onLoad'> {
	/** (default start) align the slides with the start or center of the container */
	align?: 'center' | 'start'
	/** (default 50) 1 - 100. How hard to brake swiping animation after letting go */
	braking?: number
	children: JSX.Element[] | JSX.Element
	/** prevent dragging slides */
	disabled?: boolean
	/** (default quart) set the ease stop animation for when stopMode != 'free' */
	easingFunction?: EasingFunction
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
	/** render component over swiper (used for controls, fade effect, etc.) */
	Overlay?: (props: SwiperOverlayProps) => JSX.Element
	/** (default 1) helpful when applying transform scale to swiper to match swipe movements */
	scale?: number
	/** (default single) stop after a single slide, animate slides per braking stopping on whole slide (multiple) or wherever it lies (free)  */
	stopMode?: 'single' | 'multiple' | 'free'
	/** change to vertical swiper */
	vertical?: boolean
}

export type EasingFunction = 'linear' | 'overshoot' | 'quad' | 'quart'

export declare interface SwiperOverlayProps {
	currentIndex: number
	methods: SwiperMethods
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
		easingFunction = 'quart',
		endMode = 'elastic',
		fit,
		gap = 0,
		goTo: goToParent = 0,
		goToTime = 500,
		onClickCapture,
		onLoad,
		onMouseDown,
		onMouseLeave,
		onMouseMove,
		onMouseUp,
		onSwipeEnd,
		onSwipeStart,
		onTouchCancel,
		onTouchEndCapture,
		onTouchMove,
		onTouchStart,
		Overlay,
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
	const hasOverlay = Boolean(Overlay)

	const slideCountRef = useRef(0)
	slideCountRef.current = slideCount
	const goToRef = useRef(0)
	goToRef.current = goTo

	useLayoutEffect(() => {
		addStyle()
		preventScrolling()
	}, [])

	useLayoutEffect(() => {
		updateDimensions()
		window.addEventListener('resize', updateDimensions)
		return () => window.removeEventListener('resize', updateDimensions)
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
		const updatedDimensions = makeDimensions(containerRef.current, gap, vertical, hasOverlay, fit)
		if (isEqual(updatedDimensions, dimensions)) return

		setDimensions(updatedDimensions)
		setPosition(positionFromIndex(updatedDimensions, goToRef.current))
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
		const startClock = getCurrentClock()
		v.current.animationInterval = setInterval(() => {
			const clock = getCurrentClock() - startClock
			if (clock >= duration) return stopSwiping(desiredIndex)

			const easing = desiredIndex == null ? 'quart' : easingFunction
			let newPosition = position + distance * easyDoesIt(clock / duration, easing)
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

	function preventScrolling() {
		containerRef.current?.addEventListener('touchmove', handlePreventDefault)
	}

	function allowScrolling() {
		containerRef.current?.removeEventListener('touchmove', handlePreventDefault)
	}

	function handleTouchDown(e: TouchEvent<HTMLDivElement>) {
		handleDown(e.targetTouches[0])
	}

	function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
		handleDown(e)
	}

	function handleDown({ pageX, pageY }: { pageX: number; pageY: number }) {
		clearInterval(v.current.animationInterval)
		v.current.isTouching = true
		const pagePosition = vertical ? pageY : pageX
		const scrollPosition = vertical ? pageX : pageY
		const movement: Movement = { pagePosition, scrollPosition, time: getCurrentClock() }
		v.current.movements = new Array(5).fill(movement)
	}

	function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
		handleMove(e.targetTouches[0])
	}

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		handleMove(e)
	}

	function handleMove({ pageX, pageY }: { pageX: number; pageY: number }) {
		const { isSwiping, isTouching, movements } = v.current
		if (disabled || !isTouching || slideCount === 1) return

		const pagePosition = vertical ? pageY : pageX
		const scrollPosition = vertical ? pageX : pageY

		if (!isSwiping) {
			const startPagePosition = movements[0].pagePosition
			const startScrollPosition = movements[0].scrollPosition
			const startSwiping = startedSwiping(pagePosition, startPagePosition, scale)
			const startScrolling = startedSwiping(scrollPosition, startScrollPosition, scale)
			if (startSwiping) {
				v.current.isSwiping = true
				onSwipeStart?.()
			} else {
				if (startScrolling) {
					v.current.isTouching = false
					allowScrolling()
				}
				return
			}
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
		const movement: Movement = { pagePosition, scrollPosition, time: getCurrentClock() }
		v.current.movements.push(movement)
	}

	function handleUp() {
		v.current.isTouching = false
		preventScrolling()
		if (!v.current.isSwiping) return

		const deceleration = getDeceleration(braking)
		let velocity = velocityFromMovements(v.current.movements)
		let desiredDistance = howFar(velocity, deceleration)
		let desiredIndex: number | undefined

		if (!isCarousel) {
			const distanceToStart = gap - position
			const distanceToEnd = overflowDistance - position
			if (distanceToStart > 0) {
				return finishSwiping(distanceToStart, SNAP_BACK_TIME, 0)
			} else if (distanceToEnd < 0) {
				return finishSwiping(distanceToEnd, SNAP_BACK_TIME, slideCount - 1)
			} else {
				const clampedDistance = clamp(desiredDistance, distanceToEnd, distanceToStart)
				if (clampedDistance !== desiredDistance) desiredIndex = clampedDistance > 0 ? slideCount - 1 : 0
				desiredDistance = clampedDistance
				if (!desiredDistance) velocity = 0
			}
		}

		if (stopMode !== 'free') {
			const { next, prev, total } = snapDistance(position, slides, desiredDistance, center)
			if (!total) {
				const decelerationToNext = calculateDeceleration(velocity, next.distance)
				if (decelerationToNext > MIN_DECELERATION_TO_NEXT) {
					desiredDistance = next.distance
					desiredIndex = next.index
				} else {
					const closest = Math.abs(next.distance) <= Math.abs(prev.distance) ? next : prev
					desiredDistance = closest.distance
					desiredIndex = closest.index
					velocity = (desiredDistance / SNAP_BACK_TIME) * 1000
				}
			} else {
				desiredDistance = stopMode === 'single' ? next.distance : total.distance
				desiredIndex = stopMode === 'single' ? next.index : total.index
			}
		}

		const updatedDeceleration = calculateDeceleration(velocity, desiredDistance)
		const duration = howLong(velocity, updatedDeceleration)
		finishSwiping(desiredDistance, duration, desiredIndex)
	}

	/** Prevent clicking on slides when swiping */
	function captureStop(e) {
		if (v.current.isSwiping) e.stopPropagation()
		v.current.isSwiping = false
	}

	return (
		<div
			className={`canari-swipe__container${className ? ' ' + className : ''}`}
			ref={containerRef}
			onClickCapture={e => {
				captureStop(e)
				onClickCapture?.(e)
			}}
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
			onTouchEndCapture={e => {
				handleUp()
				captureStop(e)
				onTouchEndCapture?.(e)
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
			{Overlay && <Overlay {...{ currentIndex, methods }} />}
			{children}
		</div>
	)
}

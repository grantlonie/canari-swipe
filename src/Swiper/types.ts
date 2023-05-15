import { HTMLProps } from 'react'

export interface SwiperProps extends HTMLProps<HTMLDivElement> {
	/** (default medium) how hard to brake swiping animation after letting go  */
	braking?: 'soft' | 'medium' | 'hard'
	/** center the current slide in the container */
	center?: boolean
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

export interface InstanceVariables {
	/** timer used during animation */
	animationInterval?: NodeJS.Timer
	/** true after swiper has been initialized */
	initialized: boolean
	/** user is swiping - moving while touching */
	isSwiping: boolean
	/** mouse or touch down inside container */
	isTouching: boolean
	/** stack of final user touch movements to calculate velocity after letting go */
	movements: Movement[]
}

export interface Movement {
	/** touch position */
	pagePosition: number
	/** ms at position */
	time: number
}

export interface Dimensions {
	container: Omit<Dimension, 'startPosition'>
	slides: Dimension[]
}

export interface Dimension {
	/** position needed to get to start of the slide */
	startPosition: number
	/** width or height if vertical */
	span: number
	/** height or width if vertical */
	thick: number
}

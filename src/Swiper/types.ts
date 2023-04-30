export interface SwiperProps {
	/** (default medium) how hard to brake swiping animation after letting go  */
	braking?: 'soft' | 'medium' | 'hard'
	children: JSX.Element[] | JSX.Element
	/** prevent dragging slides */
	disabled?: boolean
	/** (default elastic) apply elastic effect or rigid at the end of the slides or carousel them back around */
	endMode?: 'elastic' | 'rigid' | 'carousel'
	/** (default 0) used to set initial slide and to control externally */
	goTo?: number
	/** (default 500ms) time it takes to transition to desired slide */
	goToTime?: number
	/** only render visible and neighbor slides */
	lazy?: boolean
	/** called when swiping starts */
	onSwipeStart?: () => void
	/** called when swiping ends with current slide*/
	onSwipeEnd?: (slide: number) => void
	/** return callable methods */
	onLoad?: (methods: Methods) => void
	/** (default 1) helpful when applying transform scale to swiper to match swipe movements */
	scale?: number
	/** (default single) stop after a single slide, animate slides per braking stopping on whole slide (multiple) or wherever it lies (free)  */
	stopMode?: 'single' | 'multiple' | 'free'
	/** (default 1) show multiple slides at the same time */
	visible?: number
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
	/** the desired slide to stop at */
	desiredSlide?: number
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
